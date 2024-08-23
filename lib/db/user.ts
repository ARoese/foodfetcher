"use server";

import { auth, createPassword, signIn, verifyPasswordAgainstDB } from "@/auth";
import { DAYS } from "@/prisma/consts";
import { Plan, Prisma, PrismaClient, Recipe, User } from "@prisma/client";

const prisma = new PrismaClient();

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;
export type SafeUser = Without<User, "passhash">;

export async function updateUser(userId : number, userName : string, preferredSystem : string, currentPassword : string, newPassword : string|undefined) : Promise<void>{
    // only user who know their own passwords can get through this function anyways; no
    // need to ensure they are actually logged in or anything
    if(!verifyPasswordAgainstDB(currentPassword, userId)){
        throw new Error("Incorrect current password");
    }

    if(["imperial", "metric"].indexOf(preferredSystem) == -1){
        throw new Error("Invalid measure system");
    }

    // TODO: make sure new validated password is valid
    const newPasswordHash = newPassword !== undefined ? await createPassword(newPassword) : undefined;
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            name: userName,
            preferredMeasureSystem: preferredSystem,
            passhash: newPasswordHash
        }
    });
}

export async function getCurrentUserOrLogin() : Promise<SafeUser> {
    const currentUser = await getCurrentUser();
    // if not logged in, send them to do so
    if(!currentUser){
        signIn();
    }else{
        return currentUser;
    }
}

export async function getCurrentUser() : Promise<SafeUser | null> {
    const session = await auth();
    if(!session){
        return null
    }
    // get user who is logged in
    return await prisma.user.findUnique({
        where: {
            id: Number(session.user.id)
        },
        omit: {
            passhash: true
        }
    });
}