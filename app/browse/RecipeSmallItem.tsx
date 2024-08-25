"use client";
import { MouseEventHandler } from "react";
import { Recipe } from "@prisma/client";
import recipeImageJsx from "../../lib/recipeUtil";

type args = {recipe : Recipe, className?: string, newTab?: boolean, onClick?: () => void | null}
function RecipeSmallItem({recipe, className = "", onClick = null, newTab = false} : args) {
    // There could be a lot of results, and we really don't want to load them all
    // eagerly. So. prefetch is off here

    const onAnchor : MouseEventHandler<HTMLAnchorElement> = (e) => {
        if(onClick){
            e.preventDefault();
            onClick();
        }
    }

    return ( 
        // TODO: this needs to be hard navigation, because next soft navigation does not request the
        // page if it has been before. This results in displaying stale data. Find out how to fix this.

        // A promising fix to this is using revalidatePath in server action. (either when something
        // is updated, or every time the route is touched) It MAY invalidate client-side cache
        // for navs to this page. https://github.com/vercel/next.js/discussions/54075
        <div className={className}>
            <a href={`/recipe/${recipe.id}`} onClick={onAnchor} target={newTab ? "_blank" : "_self"}>
                {recipeImageJsx(recipe.imageFile)}
                <p className="text-center">{recipe.name}</p>
            </a>
        </div>
        
     );
}

export default RecipeSmallItem;