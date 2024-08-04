"use client";
import Image from "next/image";
import recipeImage from "@/public/images/logo.png";
import Link from "next/link";

function RecipeSmallItem({recipe}) {
    // There could be a lot of results, and we really don't want to load them all
    // eagerly. So. prefetch is off here
    return ( 
        // TODO: this needs to be hard navigation, because next soft navigation does not request the
        // page if it has been before. This results in displaying stale data. Find out how to fix this.

        // A promising fix to this is using revalidatePath in server action. (either when something
        // is updated, or every time the route is touched) It MAY invalidate client-side cache
        // for navs to this page. https://github.com/vercel/next.js/discussions/54075
        <a  className="m-2" href={`/recipe/${recipe.id}`}>
            <Image width="0" height="0" src={recipeImage} alt="Recipe cover image"/>
            <p className="text-center">{recipe.name}</p>
        </a>
     );
}

export default RecipeSmallItem;