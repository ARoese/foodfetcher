"use client";
import { useState, useEffect, MouseEventHandler } from "react";
import RecipesDisplay from "./RecipesDisplay";
import {getRecipes} from "../../lib/db/recipes";
import questionLogo from "@/public/images/logo-dark-question.png";
import Image from "next/image";

const RECIPES_PER_PAGE = 12;

type activeSearchInfo = {
    name : string,
    author : string,
    keywords : string,
    page: number
}

const defaultSearchInfo : activeSearchInfo = {
    page: 1,
    name: "",
    author: "",
    keywords: ""
}

const localStorageKey = "foodfetcher_browse_form_storedSearch";

function getLocallyStoredSearch() : activeSearchInfo {
    var parsed : activeSearchInfo | null;
    const fromStorage = localStorage.getItem(localStorageKey);
    try{
        
        parsed = JSON.parse(fromStorage) as activeSearchInfo;
    }catch{
        parsed = null;
    }
    
    if(!parsed){
        return {
            ...defaultSearchInfo
        }
    }else{
        return parsed;
    }
}

function setLocallyStoredSearch(stored : activeSearchInfo) {
    const objString = JSON.stringify(stored);
    localStorage.setItem(localStorageKey, objString);
}

function RecipeSearchForm() {
    const [gotLocal, setGotLocal] = useState(false);
    const [search, setSearch] = useState({...defaultSearchInfo} as activeSearchInfo);
    const [activeSearch, setActiveSearch] = useState(search as activeSearchInfo);
    const [display, setDisplay] = useState({numPages: 0, recipes: []});

    // pull from local storage any saved search options
    // this re-populates the search box and results with what
    // the user searched for last time they were on this page

    // NOTE: This should really be done outside of a
    // useEffect, but that causes a hydration error from ssr which
    // does not have access to localStorage. The purpose of this useEffect
    // is *solely* so that ssr knows that things related to this are allowed
    // to vary between client and server renders
    useEffect(() => {
        const stored = getLocallyStoredSearch();
        setSearch(stored);
        setActiveSearch(stored);
        setGotLocal(true);
    },
    []);

    // Whenever the user's search changes, re-query and re-populate with the results
    useEffect(() => {
        if(!gotLocal){
            // don't query until localStorage has been loaded
            // the initial run of this effect should do nothing,
            // and it will be re-triggered by the completion of
            // the above effect.
            return;
        }
        getRecipes(activeSearch.page,RECIPES_PER_PAGE, {
            name: activeSearch.name != "" ? activeSearch.name : undefined,
            author: activeSearch.author != "" ? activeSearch.author : undefined,
            keywords: activeSearch.keywords != "" ? activeSearch.keywords : undefined,
        })
        .then(setDisplay)
        .then(() => setLocallyStoredSearch(activeSearch));
    }, [activeSearch, gotLocal]);

    // setters for members of search
    function setSearchAuthor(author){
        setSearch({...search, author});
    }
    function setSearchName(name){
        setSearch({...search, name});
    }
    function setSearchKeywords(keywords){
        setSearch({...search, keywords})
    }

    // keep page selection bound under numPages
    //if(display.numPages != 0 && page > display.numPages){
    //    setPage(display.numPages);
    //}

    const onClickSearch : MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();
        setActiveSearch({...search, page: 1});
    }

    function onClickClear(){
        setSearchAuthor("");
        setSearchKeywords("");
        setSearchName("");
        setActiveSearch({author: "", keywords: "", name: "", page: 1});
    }

    function incrementPage(){
        const page = activeSearch.page < display.numPages ? activeSearch.page+1 : display.numPages;
        setActiveSearch({...activeSearch, page: page == 0 ? 1 : page});
    }

    function decrementPage(){
        var page = activeSearch.page > 1 ? activeSearch.page-1 : 1;
        setActiveSearch({...activeSearch, page});
    }

    return ( 
        <>
        <h1>Search Recipes</h1>
        <div className="flex flex-col md:flex-row">
            <div className="relative min-w-60 mb-6">
                <form className="sticky top-4 flex flex-col mr-4">
                    <label>
                        Recipe Name:<br/>
                        <input className="w-full" type="text" placeholder="steamed hams" value={search.name} onChange={(e) => setSearchName(e.target.value)}/>
                    </label>
                    <label>
                        Author:<br/>
                        <input className="w-full" type="text" placeholder="John Smith" value={search.author} onChange={(e) => setSearchAuthor(e.target.value)}/>
                    </label>
                    <label>
                        Keywords:<br/>
                        <input className="w-full" type="text" placeholder="walnuts, sugar, milk" value={search.keywords} onChange={(e) => setSearchKeywords(e.target.value)}/>
                    </label>
                    <button onClick={onClickSearch}>Search</button>
                    <button onClick={onClickClear} type="reset">Clear</button>
                </form>
            </div>
            
                {
                    display.numPages > 0
                    /* if there are recipes to show, display them */
                    ? <div className="flex flex-col">
                        <RecipesDisplay recipes={display.recipes}/>
                        {/* page selector */}
                        <div className="mx-auto flex flex-row">
                            <button className="mr-4" onClick={decrementPage}>{"<"}</button>
                            <div className="flex flex-col content-center">
                                {activeSearch.page}
                                <hr className="border-black" />
                                {display.numPages}
                            </div>
                            
                            <button className="ml-4" onClick={incrementPage}>{">"}</button>
                        </div>
                    </div>
                    /* otherwise, say there are none to display */
                    : <div className="w-full">
                        <Image className="w-1/3 mx-auto" src={questionLogo} alt="foodfetcher logo with question marks"/>
                        <p className="text-center">
                            {
                                gotLocal 
                                ? "No results. Modify your search and try again"
                                : "Loading... Please wait"
                            }
                        </p>
                    </div>
                }
        </div>
        </>
    );
}

export default RecipeSearchForm;