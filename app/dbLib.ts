"use server";

import { auth, createPassword, verifyPasswordAgainstDB } from "@/auth";
import { PrismaClient, Recipe, User } from "@prisma/client";

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

async function checkCanModifyRecipe(recipeId : number){
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