"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getRecipes(page : number = 1, count : number = 12){
    page-=1;
    const numPages = Math.ceil(await prisma.recipe.count() / count); // TODO: do critera
    const recipes = await prisma.recipe.findMany(
        {
            skip: page*count,
            take: count
        }
    );

    return {numPages, recipes};
}

export async function updateRecipe({ id, creatorId, name, instructions, videoFile, imageFile, ingredients} ) : Promise<void>{
    await prisma.recipe.upsert({
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