"use server";

import { auth } from "@/auth";
import { PrismaClient, Recipe } from "@prisma/client";

const prisma = new PrismaClient();

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