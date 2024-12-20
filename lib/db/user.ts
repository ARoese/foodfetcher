// TODO: exchange all errors thrown directly for display on the UI for a wrapper
// object that will not be redacted in production. Use a variation on the either
// monad for this on server and client-side
"use server";

import { auth, createPassword, verifyPasswordAgainstDB } from "@/auth";
import { PrismaClient, User } from "@prisma/client";
import { redirect } from "next/navigation";
import { intoError, intoResult, ServerActionResponse } from "../actions";
import { setTimeout } from "timers/promises";

const prisma = new PrismaClient();

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export type SafeUser = 
    Without<User, "passhash"> 
    & {passhash?: never}; //prevent any sort of casting by explicitly making passhash a "never" type

// TODO: all server actions should return an object with the error reason instead of actually throwing an error

/** returns true if the username is taken */
async function usernameTaken(username : string){
    const count = await prisma.user.count({
        where: {
            name: username
        }
    });

    return count != 0;
}

export async function createUser(username : string, password : string) : Promise<ServerActionResponse<void>> {
    if(username.trim() != username){
        return intoError("Username cannot be empty or include whitespace at its start or end");
    }

    if(await usernameTaken(username)){
        return intoError("This username is already taken");
    }

    // TODO: do strict password checks here
    await prisma.user.create({
        data: {
            name: username,
            passhash: await createPassword(password)
        }
    });
}

export async function deleteUser(id: number) : Promise<ServerActionResponse<void>> {
    const currentUser = await getCurrentUser();
    if(currentUser == null){
        return intoError("You are not logged in");
    }

    if(!(currentUser.admin || currentUser.id == id)){
        return intoError("You do not have permission to do this.");
    }

    const deleteResult = await prisma.user.deleteMany({
        where: {id: id}
    });

    if(deleteResult.count == 0){
        return intoError("User not found");
    }

    return intoResult(null);
}

export async function updateUser(
        userId : number,
        userName : string, 
        preferredSystem : string, 
        currentPassword : string, 
        newPassword : string|undefined) : Promise<ServerActionResponse<void>>{
    if(["imperial", "metric"].indexOf(preferredSystem) == -1){
        return intoError("Invalid measure system");
    }
    const [{name: currentUser}, isNameTaken, isPasswordCorrect] = await Promise.all([
        prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                name: true
            }
        }),
        usernameTaken(userName),
        verifyPasswordAgainstDB(currentPassword, userId)
    ]);
    
    // if they're changing their username and the new one is already taken
    if(currentUser != userName && isNameTaken){
        return intoError("This username is already taken");
    }
    
    // only user who know their own passwords can get through this function anyways; no
    // need to ensure they are actually logged in or anything
    if(!isPasswordCorrect){
        return intoError("Incorrect current password");
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
        redirect("/api/auth/signin");
    }else{
        return currentUser;
    }
}

export async function getCurrentUser() : Promise<SafeUser | null> {
    const session = await auth();
    if(!session){
        return null;
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

export async function getAllAdmins() : Promise<SafeUser[]> {
    const allAdminUsers = await prisma.user.findMany({
        where: {
            admin: true
        },
        omit: {
            passhash: true
        }
    });

    return allAdminUsers;
}

export async function setAdminStatus(id : number, newStatus : boolean) : Promise<ServerActionResponse<void>>{
    const currentUser = await getCurrentUser();
    if(!currentUser?.admin){
        return intoError("You do not have permission to do this.");
    }

    const updateResult = await prisma.user.updateMany({
        where: {id: id},
        data: {admin: newStatus}
    });

    if(updateResult.count == 0){
        return intoError("Failed to update the user. User with id not found.");
    }

    return intoResult(null);
}

export async function getUsersLikeName(name : string, limit : number) : Promise<SafeUser[]> {
    const allUsersLike = await prisma.user.findMany({
        where: {
            name: {contains: name}
        },
        omit: {
            passhash: true
        },
        take: limit > 0 ? limit : undefined
    });

    return allUsersLike;
}