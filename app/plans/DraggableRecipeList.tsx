"use client";
import type { Recipe } from "@prisma/client";
import RecipeSmallItem from "../browse/RecipeSmallItem";
import DraggableSmallRecipe from "./DraggableSmallRecipe";


type args = {recipes : Recipe[]};
function DraggableRecipeList({recipes} : args) {
    //console.log(recipes);
    return ( 
        <div className="flex flex-row overflow-x-scroll flex-nowrap border-2 border-black">
            {
                recipes.map(
                    (recipe) => <DraggableSmallRecipe key={recipe.id} recipe={recipe}/>
                )
            }
        </div>
     );
}

export default DraggableRecipeList;