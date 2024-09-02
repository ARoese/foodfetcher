"use client";
import { useState, useEffect, MouseEventHandler } from "react";
import RecipesDisplay from "./RecipesDisplay";
import {getRecipes} from "../../lib/db/recipes";

const defaultRecipes = require("../api/recipes/defaultRecipes.json");
const RECIPES_PER_PAGE = 12;


function RecipeSearchForm() {
    const [display, setDisplay] = useState({numPages: 0, recipes: []});
    const [page, setPage] = useState(1);
    const [searchName, setSearchName] = useState("");
    const [searchAuthor, setSearchAuthor] = useState("");
    const [searchKeywords, setSearchKeywords] = useState("");

    // keep page selection bound under numPages
    if(display.numPages != 0 && page > display.numPages){
        setPage(display.numPages);
    }

    useEffect(() => {
        getRecipes(page,RECIPES_PER_PAGE)
            .then((data) => setDisplay(data))
    }, [page]);



    const onClickSearch : MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();
        getRecipes(page,RECIPES_PER_PAGE, {
            name: searchName != "" ? searchName : undefined,
            author: searchAuthor != "" ? searchAuthor : undefined,
            keywords: searchKeywords != "" ? searchKeywords : undefined,
        }).then((data) => setDisplay(data));
    }

    return ( 
        <>
        <h1>Search Recipes</h1>
        <div className="flex flex-col md:flex-row">
            <div className="relative min-w-60 mb-6">
                <form className="sticky top-4 flex flex-col mr-4">
                    <label>
                        Recipe Name:<br/>
                        <input className="w-full" type="text" placeholder="steamed hams" value={searchName} onChange={(e) => setSearchName(e.target.value)}/>
                    </label>
                    <label>
                        Author:<br/>
                        <input className="w-full" type="text" placeholder="John Smith" value={searchAuthor} onChange={(e) => setSearchAuthor(e.target.value)}/>
                    </label>
                    <label>
                        Keywords:<br/>
                        <input className="w-full" type="text" placeholder="walnuts, sugar, milk" value={searchKeywords} onChange={(e) => setSearchKeywords(e.target.value)}/>
                    </label>
                    <button onClick={onClickSearch}>Search</button>
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