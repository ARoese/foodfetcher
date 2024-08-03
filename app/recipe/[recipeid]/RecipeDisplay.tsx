"use client";

import Image from "next/image";
import recipeImage from "@/public/images/logo.png";
import { useState } from "react";
import type { Prisma } from "@prisma/client";
import IngredientItem from "./IngredientItem";
import {toast} from 'react-toastify'
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

function RecipeDisplay({recipe} : {recipe: RecipeWithRelations}) {
    const [dynRecipe, setDynRecipe] = useState(recipe);
    const [beingEdited, setBeingEdited] = useState(false);
    const [saving, setSaving] = useState(false);

    /* Save a recipe back to the database */
    async function handleSaveRecipe() : Promise<void> {
        async function doSave(){
            //if(dynRecipe == recipe){
            //    return;
            //}
            
            const resolveAfter1Sec = new Promise(resolve => setTimeout(resolve, 3000));
            await toast.promise(resolveAfter1Sec, {
                    pending: "Saving recipe",
                    success: "Saved recipe",
                    error: "Failed to save recipe",
                }, 
                {
                    autoClose: 10000,
                    position: "bottom-right"
                }
            );
        }
        setBeingEdited(false);
        setSaving(true);
        await doSave();
        setSaving(false);
    }

    return ( 
        <>
        {
            beingEdited
            ? (
                <>
                <button onClick={async () => await handleSaveRecipe()}>Save</button>
                <button onClick={() => {setDynRecipe(recipe); setBeingEdited(false)}}>Cancel</button>
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
                    </ul>
                </div>
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
    return dynRecipe.ingredients.map(
        (ingredient, i) => 
            <IngredientItem 
                key={i} 
                beingEdited={beingEdited}
                ingredient={ingredient}
                // each ingredientItem gets an updator function that will
                // correctly and safely update the recipe state up here.
                // all they have to do is call it with the new ingredientEntry
                setIngredient={ 
                    (newIngredient : IngredientEntry|null) : void => {
                        setDynRecipe(
                            newIngredient === null
                            ? {...dynRecipe, ingredients: dynRecipe.ingredients.toSpliced(i, 1)}
                            : {...dynRecipe, ingredients: dynRecipe.ingredients.with(i, newIngredient)}
                        )
                    }
                }
            />
    )
}

export default RecipeDisplay;