"use server";

import { auth } from "@/auth";
import { Prisma, PrismaClient, Recipe } from "@prisma/client";

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