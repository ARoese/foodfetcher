import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req){
    const recipes = await prisma.recipe.findMany();

    return NextResponse.json(recipes);
}