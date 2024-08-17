"use client";
import { Recipe } from "@prisma/client"
import recipeImage from "@/public/images/logo.png";
import Image from "next/image";

export default function recipeImageJsx(recipe : Recipe){
    
    return recipe.imageFile
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={`/api/media/image/${recipe.imageFile}`} alt="Recipe cover image"/>
        : <Image width="0" height="0" src={recipeImage} alt="Recipe cover image"/>
}