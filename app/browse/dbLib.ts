"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function getRecipes(page : number = 1, count : number = 12){
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