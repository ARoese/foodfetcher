import { NextResponse } from "next/server";

const defaultRecipes = require("./defaultRecipes.json");
export async function GET(req){
    return NextResponse.json(defaultRecipes);
}