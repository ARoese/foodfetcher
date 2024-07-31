import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const defaultRecipes = require("../defaultRecipes.json");

const prisma = new PrismaClient();

export async function GET(req, {params}){
    const res = await prisma.recipe.findUnique({
        where: {
            id: params.recipeid
        }
    });

    if (res === null) {
        return NextResponse.json({}, 
            {
                status: 404
            }
        );
    }else{
        return NextResponse.json(res);
    }
}