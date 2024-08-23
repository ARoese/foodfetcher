"use server";

import { auth, createPassword, verifyPasswordAgainstDB } from "@/auth";
import { DAYS } from "@/prisma/consts";
import { Plan, Prisma, PrismaClient, Recipe, User } from "@prisma/client";

const prisma = new PrismaClient();

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