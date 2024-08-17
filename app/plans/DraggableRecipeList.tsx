"use client";
import type { Recipe } from "@prisma/client";
import RecipeSmallItem from "../browse/RecipeSmallItem";
import DraggableSmallRecipe from "./DraggableSmallRecipe";


type args = {recipes : Recipe[]};
function DraggableRecipeList({recipes} : args) {
    //console.log(recipes);
    return ( 
        <div className="flex flex-row overflow-x-scroll min-h-32 flex-nowrap border-2 border-black">
            {
                recipes.map(
                    (recipe) => <DraggableSmallRecipe key={`draggableSource ${recipe.id}`} recipe={recipe}/>
                )
            }
        </div>
     );
}

export default DraggableRecipeList;