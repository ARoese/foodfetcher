"use client";
import { useState, useEffect } from "react";
import RecipesDisplay from "./RecipesDisplay";
import getRecipes from "./dbLib";

const defaultRecipes = require("../api/recipes/defaultRecipes.json");

function RecipeSearchForm() {
    const [display, setDisplay] = useState({numPages: 0, recipes: []});
    const [page, setPage] = useState(1);
    useEffect(() => {
        getRecipes(page,12)
            .then((data) => setDisplay(data))
    }, [page]);

    //console.log(display);

    return ( 
        <>
        <h1>Search Recipes</h1>
        <div className="flex flex-row">
            <div className="relative">
                <form className="sticky top-4 flex flex-col mr-4">
                    <label>
                        Recipe Name:
                        <input type="text" placeholder="steamed hams"/>
                    </label>
                    <label>
                        Author:
                        <input type="text" placeholder="John Smith"/>
                    </label>
                    <label>
                        Keywords:
                        <input type="text" placeholder="walnuts, ice cream, sugar"/>
                    </label>
                </form>
            </div>
            <div className="flex flex-col">
                <RecipesDisplay recipes={display.recipes}/>
                <div className="mx-auto flex flex-row">
                    <button className="mr-4" onClick={() => setPage((p) => Math.max(1,p-1))}>{"<"}</button>
                    <div className="flex flex-col content-center">
                        {page}
                        <hr className="border-black" />
                        {display.numPages}
                    </div>
                    
                    <button className="ml-4" onClick={() => setPage((p) => Math.min(display.numPages,p+1))}>{">"}</button>
                </div>
            </div>
        </div>
        </>
    );
}

export default RecipeSearchForm;