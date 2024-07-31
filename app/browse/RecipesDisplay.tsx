"use client";
import RecipeSmallItem from "./RecipeSmallItem";

function RecipesDisplay({recipes}) {
    return ( 
        <div className="grid grid-cols-3">
            {
                recipes.map(
                    (recipe) => <RecipeSmallItem key={recipe.id} recipe={recipe}/>
                )
            }
        </div>
     );
}

export default RecipesDisplay;