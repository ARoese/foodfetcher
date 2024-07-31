import { NextResponse } from "next/server";
const defaultRecipes = require("../defaultRecipes.json");

export async function GET(req, {params}){
    const isValid = params.recipeid < defaultRecipes.length;
    const res = isValid ? defaultRecipes[params.recipeid] : {};
    return NextResponse.json(res, 
        {
            status: isValid ? 200 : 404
        }
    );
    
}