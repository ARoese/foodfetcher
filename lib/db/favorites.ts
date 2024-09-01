"use server";

import { auth } from "@/auth";
import { PrismaClient, Recipe } from "@prisma/client";
import { intoError, intoResult, ServerActionResponse } from "../actions";

const prisma = new PrismaClient();

export async function getFavorites() : Promise<ServerActionResponse<Recipe[]>> {
    const session = await auth();
    if(session == null){
        return intoError("You are not logged in");
    }

    const userReq = await prisma.user.findUnique({
        where: {
            id: +session.user.id
        },
        select: {
            favorites: true
        }
    });

    return intoResult(userReq.favorites);
}

export async function hasFavorited(recipeId : number) : Promise<ServerActionResponse<boolean>> {
    const session = await auth();
    if(session == null){
        return intoResult(false);
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


    return intoResult(favoritesCount._count.favorites > 0);
}

export async function setFavorite(recipeId : number, isFavorited : boolean) : Promise<ServerActionResponse<void>>{
    const session = await auth();
    if(session == null){
        return intoError("You are not logged in");
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