"use client";
import { useState, useEffect } from "react";
import RecipesDisplay from "./RecipesDisplay";

const defaultRecipes = require("../api/recipes/defaultRecipes.json");

function RecipeSearchForm() {
    const [Recipes, setRecipes] = useState([]);
    useEffect(() => {
        fetch("/api/recipes")
            .then((res) => res.json())
            .then((data) => setRecipes(data))
    }, []);

    return ( 
        <>
        <h1>Search Recipes</h1>
        <div className="flex flex-row">
            <form className="flex flex-col mr-4">
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
            <RecipesDisplay recipes={Recipes}/>
        </div>
        
        </>
    );
}

export default RecipeSearchForm;