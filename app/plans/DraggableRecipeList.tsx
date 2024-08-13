"use client";
import type { Recipe } from "@prisma/client";
import RecipeSmallItem from "../browse/RecipeSmallItem";


type args = {recipes : Recipe[]};
function DraggableRecipeList({recipes} : args) {
    //console.log(recipes);
    return ( 
        <div className="flex flex-row overflow-x-scroll flex-nowrap border-2 border-black">
            {
                recipes.map(
                    (recipe) => 
                        // TODO: modify RecipeSmallItem to have a more compatible display here
                        <div className="max-w-40 min-w-40 mx-2" key={recipe.id}>
                            <RecipeSmallItem recipe={recipe}/>
                        </div>
                )
            }
        </div>
     );
}

export default DraggableRecipeList;