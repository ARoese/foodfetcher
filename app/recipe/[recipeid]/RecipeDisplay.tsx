"use client";

import Image from "next/image";
import {updateRecipe} from "@/app/dbLib"
import recipeImage from "@/public/images/logo.png";
import { useRef, useState } from "react";
import { PrismaClient, type Prisma } from "@prisma/client";
import IngredientItem from "./IngredientItem";
import {toast} from 'react-toastify'
import { faPlus, faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
type RecipeWithRelations = Prisma.RecipeGetPayload<{
    include: {
        creator: {
            select: {
                name: true
            }
        },
        ingredients: true
    }
}>
import type { IngredientEntry } from "@prisma/client";
import ReactTextareaAutosize from "react-textarea-autosize";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Collapsible from "react-collapsible";
import { ingredientsToText, isParsedIngredientValid, parsedIngredientToIngredientEntry, toIngredientTextGroups } from "./ingredientTools";
import { parseIngredient } from "parse-ingredient";

function RecipeDisplay({recipe} : {recipe: RecipeWithRelations}) {
    const [cancelRecipe, setCancelRecipe] = useState(recipe);
    const [dynRecipe, setDynRecipe] = useState(recipe);
    const [beingEdited, setBeingEdited] = useState(false);
    const [saving, setSaving] = useState(false);
    const [bulkExpanded, setBulkExpanded] = useState(false);
    const [bulkEditText, setBulkEditText] = useState(ingredientsToText(dynRecipe.ingredients));

    /* Save a recipe back to the database */
    async function handleSaveRecipe() : Promise<void> {
        async function doSave(){
            if(dynRecipe == cancelRecipe){
                toast.success("No changes to save");
                return;
            }
            
            const resolveAfter1Sec = new Promise(resolve => setTimeout(resolve, 3000));
            
            const promise = updateRecipe(dynRecipe);
            
            await toast.promise(promise, {
                    pending: "Saving recipe",
                    success: "Saved recipe",
                    error: "Failed to save recipe",
                }, 
                {
                    autoClose: 10000
                }
            );
        }

        setBeingEdited(false);
        setSaving(true);
        // TODO: go back to editing if the save fails for any reason
        // this should keep the current values that failed to save
        // so they can be tried again or modified
        await doSave(); 
        setCancelRecipe(dynRecipe);
        // ensure bulk edit stays consistent
        setBulkEditText(ingredientsToText(dynRecipe.ingredients))
        setSaving(false);
    }

    function addNewIngredient(){
        setDynRecipe({
            ...dynRecipe,
            ingredients: [
                ...dynRecipe.ingredients,
                {
                    id: null,
                    ingredientName: "new ingredient",
                    measureSymbol: null,
                    amount: 0,
                    amount2: null,
                    sortIndex: dynRecipe.ingredients.length,
                }
            ]
        });
    };

    function updateBulk(){
        const parsed = parseIngredient(bulkEditText)
            .filter(isParsedIngredientValid)
            .map((i) => parsedIngredientToIngredientEntry(i))
            .map((ie, i) => ({...ie, sortIndex: i})); // set sort indexes
        
        setDynRecipe({
            ...dynRecipe,
            ingredients: parsed
        });
    }

    
    const bulkEditDropdownTrigger = (
        <div className="w-full bg-teal-700 text-white flex flex-row">
            <p className="w-full bg-teal-700 text-white mr-auto my-auto text-center">Bulk Ingredient Editing</p>
            <FontAwesomeIcon icon={bulkExpanded ? faCaretUp : faCaretDown} className="mr-1 my-auto"/>
        </div>
        
    );

    return ( 
        <>
        {
            beingEdited
            ? (
                <>
                <button onClick={async () => await handleSaveRecipe()}>Save</button>
                <button onClick={() => {setDynRecipe(cancelRecipe); setBeingEdited(false)}}>Cancel</button>
                </>
            )
            : <button disabled={saving} onClick={() => setBeingEdited(true)}>Edit</button>
        }
        
        {
            beingEdited
            ? <div className="mx-auto text-center"><input className="text-center" value={dynRecipe.name} onChange={(e) => setDynRecipe({...dynRecipe, name: e.target.value})}/></div>
            : <h1>{dynRecipe.name}</h1>
        }
        <h2>{dynRecipe.creator.name}</h2>
        <h2>{dynRecipe.updatedAt.toISOString()}</h2>
        <div className="flex flex-row">
            <Image className="w-2/5 h-fit" width="0" height="0" src={recipeImage} alt="Recipe cover image"/>
            <div className="flex flex-col w-full">
                <div>
                    <h3>Ingredients</h3>
                    <ul className="text-center">
                        {
                            IngredientItems(dynRecipe, beingEdited, setDynRecipe)
                        }
                        {   
                            beingEdited
                            ? (
                                <li>
                                    <button className="w-full" onClick={addNewIngredient}>
                                        <FontAwesomeIcon icon={faPlus}/>
                                    </button>
                                </li>
                            ) : ""
                        }
                    </ul>
                </div>
                {
                    beingEdited
                    ? (
                        <Collapsible 
                            trigger={bulkEditDropdownTrigger} 
                            className="w-full"
                            onOpening={() => setBulkExpanded(true)}
                            onClose={() => setBulkExpanded(false)}
                        >
                            {
                                bulkExpanded
                                ? (
                                    <div className="p-1">
                                        <label>
                                            Bulk ingredient import:
                                            <ReactTextareaAutosize
                                                minRows={4}
                                                style={{width: "100%"}}
                                                wrap="soft"
                                                value={bulkEditText}
                                                onChange={(e) => setBulkEditText(e.target.value)}
                                            />
                                        </label>
                                        <button type="submit" onClick={updateBulk}>Parse!</button>
                                    </div>
                                )
                                : ""
                            }
                            
                            
                        </Collapsible>
                    ) : ""
                }
                
                <hr className="border-black border-2"/>
                <div>
                    <h3>Instructions</h3>
                    {
                        beingEdited
                        ? <ReactTextareaAutosize
                            minRows={4}
                            style={{width: "100%"}}
                            className="box-border"
                            wrap="soft"
                            value={dynRecipe.instructions} 
                            onChange={(e) => setDynRecipe({...dynRecipe, instructions: e.target.value})}
                            />
                        : <p>{dynRecipe.instructions}</p>
                    }
                </div>
            </div>
        </div>
        </>
     );
}
/* 
return an IngredientItem for each ingredient in the recipe. Each item is given
an updator function for the ingredient it represent
*/
function IngredientItems(dynRecipe : RecipeWithRelations, beingEdited : boolean, setDynRecipe){
    //console.log(dynRecipe.ingredients);
    //console.log("generating ingredients");
    return dynRecipe.ingredients.map(
        (ingredient, i) => {
            return <IngredientItem 
                key={ingredient.sortIndex} 
                beingEdited={beingEdited}
                ingredient={{...ingredient, sortIndex: i}}
                // each ingredientItem gets an updator function that will
                // correctly and safely update the recipe state up here.
                // all they have to do is call it with the new ingredientEntry
                setIngredient={ 
                    (newIngredient : IngredientEntry|null) : void => {
                        //console.log(`updating ${i}`);
                        //console.log(newIngredient);
                        setDynRecipe(
                            newIngredient === null
                            ? {...dynRecipe, ingredients: [...dynRecipe.ingredients].toSpliced(i, 1)}
                            : {...dynRecipe, ingredients: dynRecipe.ingredients.with(i, newIngredient)}
                        );
                    }
                }
            />
        }
    )
}

export default RecipeDisplay;