"use server";

import { auth, createPassword, verifyPasswordAgainstDB } from "@/auth";
import { DAYS } from "@/prisma/consts";
import { Plan, Prisma, PrismaClient, Recipe, User } from "@prisma/client";

const prisma = new PrismaClient();

export type RecipeQueryParams = {name? : string, author? : string, keywords? : string}
export async function getRecipes(
        page : number = 1,
        count : number = 12,
        queryParams? : RecipeQueryParams) : Promise<{numPages : number, recipes : Recipe[]}>{
    // selectively generate elements of the AND query based on what was actually given
    const conditions : Prisma.RecipeWhereInput[] = [];
    if(queryParams?.author){
        conditions.push({ creator: { name: { contains: queryParams.author } } });
    }
    if(queryParams?.keywords){
        conditions.push(
            {
                AND: queryParams.keywords.split(',').map((e) => e.trim()).map(
                    (keyword) : Prisma.RecipeWhereInput => ({ 
                            OR: [
                            // instructions contains keyword
                            { instructions: { contains: keyword } },
                            // any ingredient has keyword
                            { ingredients: { some: { ingredientName: { contains: keyword } } } },
                            // title has keyword
                            { name: { contains: keyword } },
                        ]
                    })
                )
            }
        );
    }
    if(queryParams?.name){
        conditions.push({name: {contains: queryParams.name}});
    }
    // change from 1-based to 0-based index
    page-=1;
    // TODO: somehow make this into a single query
    const [numPages, recipes] = await Promise.all([
        // get how many recipes match the query
        prisma.recipe.count({
            where: {
                AND: conditions
            }
        }).then((res) => Math.ceil(res / count)),
        // get the page of recipes matching the query
        prisma.recipe.findMany(
            {
                skip: page*count,
                take: count,
    
                where: {
                    AND: conditions
                }
            }
        )
    ]);

    return {numPages, recipes};
}

export async function getOwnRecipes() : Promise<Recipe[]> {
    const session = await auth();
    if(session == null){
        throw new Error("You are not logged in");
    }

    const userReq = await prisma.user.findUnique({
        where: {
            id: +session.user.id
        },
        select: {
            recipes: true
        }
    });

    return userReq.recipes;
}

export async function getFavorites() : Promise<Recipe[]> {
    const session = await auth();
    if(session == null){
        throw new Error("You are not logged in");
    }

    const userReq = await prisma.user.findUnique({
        where: {
            id: +session.user.id
        },
        select: {
            favorites: true
        }
    });

    return userReq.favorites;
}

// make sure these two match
export type DeepPlan = Prisma.PlanGetPayload<{
    include: {
        days: {
            include: {
                weekday: true,
                quantRecipes: {
                    include: {
                        recipe: true,
                        quantity: true
                    }
                }
            }
        }
    }
}>;

const deepPlanInclude = {
    days: {
        include: {
            weekday: true,
            quantRecipes: {
                include: {
                    recipe: true
                }
            }
        }
    }
}

// make sure these two match
export type FullPlan = Prisma.PlanGetPayload<{
    include: {
        days: {
            include: {
                weekday: true,
                quantRecipes: {
                    include: {
                        recipe: {
                            include: {
                                ingredients: true
                            }
                        },
                        quantity: true
                    }
                }
            }
        }
    }
}>;

const fullPlanInclude = {
    days: {
        include: {
            weekday: true,
            quantRecipes: {
                include: {
                    recipe: {
                        include: {
                            ingredients: true
                        }
                    }
                }
            }
        }
    }
}

export async function updatePlan(plan : DeepPlan) : Promise<void> {
    if(!plan.name.trim()){
        throw new Error("Plans cannot have empty names.");
    }
    await prisma.plan.update({
        where: {
            id: plan.id
        },
        data: {
            name: plan.name,
            days: {
                deleteMany: {},
                create: plan.days.map((day) => ({
                    weekday: {
                        connect: {
                            name: day.dayName
                        }
                    },
                    quantRecipes: {
                        create: day.quantRecipes.map((quantRecipe) => ({
                            quantity: quantRecipe.quantity,
                            recipe: {
                                connect: {
                                    id: quantRecipe.recipeId
                                }
                            }
                        }))
                    }
                }))
            }
        }
    });
}

function sortPlanDays(plan : DeepPlan){
    // sort the days by their names so that the days are in 
    // the same order as they appear in this global DAYS array
    plan.days.sort((a, b) => DAYS.indexOf(a.dayName) - DAYS.indexOf(b.dayName));
}

export async function getMealPlan(planid : number) : Promise<FullPlan|null>{
    const session = await auth();
    if(session == null){
        throw new Error("You are not logged in");
    }

    const plan = await prisma.plan.findUnique({
        where: {
            id: planid,
            owningUserId: +session.user.id
        },
        include: fullPlanInclude
    });

    sortPlanDays(plan);

    return plan;
}

export async function getMealPlans() : Promise<DeepPlan[]> {
    const session = await auth();
    if(session == null){
        throw new Error("You are not logged in");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: +session.user.id
        },
        include: {
            plans: {
                include: deepPlanInclude,
                orderBy: {
                    id: "asc"
                }
            }
        }
    });

    user.plans.forEach(sortPlanDays);
    
    console.log(user);
    return user.plans;
}

export async function newMealPlan(userId : number, name : string) : Promise<DeepPlan> {
    // TODO: protect this
    const newPlan = await prisma.plan.create({
        data: {
            name: name,
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
    });

    sortPlanDays(newPlan);
    return newPlan;
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

// TODO: clean up these parameters
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

export async function hasFavorited(recipeId : number) : Promise<boolean> {
    const session = await auth();
    if(session == null){
        return false;
    }

    const favoritesCount = await prisma.user.findUnique({
        where: {
            id: +session.user.id
        },
        select: {
            _count: {
                select: {
                    favorites: {
                        where: {
                            id: recipeId
                        }
                    }
                }
            }
        }
    });
    console.log(favoritesCount);

    return favoritesCount._count.favorites > 0;
}

export async function setFavorite(recipeId : number, isFavorited : boolean) {
    const session = await auth();
    if(session == null){
        throw new Error("You are not logged in");
    } 

    /*
    const [currentFavorites, addedFavorite] = await Promise.all([
        prisma.user.findUnique({
            where: {
                id: +session.user.id
            },
            select: {
                favorites: true
            }
        }),
        prisma.recipe.findUnique({
            where: {
                id: recipeId
            }
        })
    ]);
    */

    await prisma.user.update({
        where: {
            id: +session.user.id
        },
        data: {
            favorites: 
            isFavorited ? {
                connect: {
                    id: recipeId
                }
            }
            : {
                disconnect: {
                    id: recipeId
                }
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