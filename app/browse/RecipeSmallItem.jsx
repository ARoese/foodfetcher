"use client";
import Image from "next/image";
import recipeImage from "@/public/images/logo.png";
import Link from "next/link";

function RecipeSmallItem({recipe}) {
    return ( 
        <Link className="m-2" href={`/recipe/${recipe.id}`}>
            <Image className="max-h-48 max-w-48" width="auto" height="auto" src={recipeImage} alt="Recipe cover image"/>
            <p className="text-center">{recipe.name}</p>
        </Link>
     );
}

export default RecipeSmallItem;