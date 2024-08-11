"use server";

import { auth, createPassword, verifyPasswordAgainstDB } from "@/auth";
import { DAYS } from "@/prisma/consts";
import { Prisma, PrismaClient, Recipe, User } from "@prisma/client";

const prisma = new PrismaClient();

export async function getRecipes(page : number = 1, count : number = 12){
    page-=1;
    const numPages = Math.ceil(await prisma.recipe.count() / count); // TODO: do criteria
    const recipes = await prisma.recipe.findMany(
        {
            skip: page*count,
            take: count
        }
    );

    return {numPages, recipes};
}

export type DeepPlan = Prisma.PlanGetPayload<{
    include: {
        days: {
            include: {
                weekday: true,
                recipes: true
            }
        }
    }
}>;
const deepPlanInclude = {
    days: {
        include: {
            weekday: true,
            recipes: true
        }
    }
}
export async function getMealPlans(userId : number) : Promise<DeepPlan[]> {
    // TODO: bug: this doesn't return the created plans on subsequent calls. Figure out why.
    const plans = await prisma.plan.findMany({
        where: {
            id: userId,
        },
        include: deepPlanInclude
    });

    // sort the days by their names so that the days are in 
    // the same order as they appear in this global DAYS array
    for(let {days} of plans){
        days.sort((a, b) => DAYS.indexOf(a.dayName) - DAYS.indexOf(b.dayName));
    }
    //console.log(userId, plans);
    return plans;
}

export async function newMealPlan(userId : number) : Promise<DeepPlan> {
    // TODO: protect this
    return await prisma.plan.create({
        data: {
            name: "New Meal Plan",
            days: {
                // always make a relational for each day in the week
                createMany: {
                    data: DAYS.map((day) => ({dayName: day}))
                }
            },
            owningUser: {
                connect: {
                    id: userId
                }
            }
        },
        include: deepPlanInclude
    })
}

export async function deleteMealPlan(planId : number){
    // TODO: protect this
    await prisma.plan.delete({
        where: {
            id: planId
        }
    });
}

async function checkCanModifyRecipe(recipeId : number) {
    // get session and recipe we're modifying
    const [session, recipe] = await Promise.all(
        [
            auth(),
            prisma.recipe.findUnique({
                where: {
                    id: recipeId
                }
            })
        ]
    );

    // check it's ok to delete it
    if(!session){
        throw new Error("Not logged in");
    }else if(recipe === null){
        throw new Error("Recipe does not exist");
    }else if(+session.user.id != recipe.creatorId){
        throw new Error("You do not own this recipe");
    }
}

export async function deleteRecipe(recipeId : number){
    // verify caller has permission to delete this recipe
    checkCanModifyRecipe(recipeId);
    // actually delete it
    await prisma.recipe.delete({
        where: {
            id: recipeId
        }
    });
}

export async function updateRecipe({ id, creatorId, name, instructions, videoFile, imageFile, ingredients} ) : Promise<Recipe>{
    // verify caller has permission to delete this recipe
    checkCanModifyRecipe(id);
    return await prisma.recipe.upsert({
        where: { id: id || -1 },  // Assuming id will be null for new recipes
        update: {
            name,
            instructions,
            videoFile,
            imageFile,
            updatedAt: new Date(),
            ingredients: {
                deleteMany: {},  // Clear existing ingredient entries to handle updates
                create: ingredients.map(ingredientEntry => ({
                amount: ingredientEntry.amount,
                amount2: ingredientEntry.amount2,
                measureSymbol: ingredientEntry.measureSymbol,
                sortIndex: ingredientEntry.sortIndex,
                ingredient: {
                    connectOrCreate: {
                    where: { name: ingredientEntry.ingredientName },
                    create: { name: ingredientEntry.ingredientName }
                    }
                }
                }))
            }
        },
        create: {
        creatorId,
        name,
        instructions,
        videoFile,
        imageFile,
        createdAt: new Date(),
        updatedAt: new Date(),
        ingredients: {
            create: ingredients.map(ingredientEntry => ({
            amount: ingredientEntry.amount,
            amount2: ingredientEntry.amount2,
            measureSymbol: ingredientEntry.measureSymbol,
            sortIndex: ingredientEntry.sortIndex,
            ingredient: {
                connectOrCreate: {
                where: { name: ingredientEntry.ingredientName },
                create: { name: ingredientEntry.ingredientName }
                }
            }
            }))
        }
        }
    });
}

export async function updateUser(userId : number, userName : string, currentPassword : string, newPassword : string|undefined) : Promise<void>{
    // only user who know their own passwords can get through this function anyways; no
    // need to ensure they are actually logged in or anything
    if(!verifyPasswordAgainstDB(currentPassword, userId)){
        throw new Error("Incorrect current password");
    }

    // TODO: make sure new validated password is valid
    const newPasswordHash = newPassword !== undefined ? await createPassword(newPassword) : undefined;
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            name: userName,
            passhash: newPasswordHash
        }
    });
}