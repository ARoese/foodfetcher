"use client";

import Image from "next/image";
import {updateRecipe} from "@/app/dbLib"
import recipeImage from "@/public/images/logo.png";
import { useState } from "react";
import { IngredientEntry, PrismaClient, type Prisma } from "@prisma/client";
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
import ReactTextareaAutosize from "react-textarea-autosize";
import IngredientsDisplay from "./IngredientsDisplay";
import BulkIngredientEditor from "./BulkIngredientEditor";

function RecipeDisplay({recipe} : {recipe: RecipeWithRelations}) {
    const [cancelRecipe, setCancelRecipe] = useState(recipe);
    const [dynRecipe, setDynRecipe] = useState(recipe);
    const [beingEdited, setBeingEdited] = useState(false);
    const [saving, setSaving] = useState(false);

    /** Update the ingredients member of the recipe */
    function setIngredients(ingredients : IngredientEntry[]){
        setDynRecipe({...dynRecipe, ingredients});
    }

    /** Save a recipe back to the database */
    async function handleSaveRecipe() : Promise<void> {
        async function doSave(){
            if(dynRecipe == cancelRecipe){
                toast.info("No changes to save");
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

        if(!dynRecipe.ingredients.every((ingredient) => ingredient.amount != 0)){
            toast.error("One or more of your ingredients are invalid. Fix them before submitting.");
            return;
        }

        setBeingEdited(false); // do this before saving so the user can't interfere
        setSaving(true); // let everything know we're saving so they lock down
        // TODO: go back to editing if the save fails for any reason
        // this should keep the current values that failed to save
        // so they can be tried again or modified
        await doSave(); 
        setCancelRecipe(dynRecipe);
        // ensure bulk edit stays consistent
        setSaving(false);
    }

    return ( 
        <>
        {
            beingEdited
            ? (
                <>
                <button onClick={async () => await handleSaveRecipe()}>Save</button>
                <button onClick={() => {setDynRecipe(cancelRecipe); setBeingEdited(false)}}>Cancel</button>
                <div className="mx-auto text-center">
                    <input className="text-center"
                        value={dynRecipe.name} 
                        onChange={(e) => setDynRecipe({...dynRecipe, name: e.target.value})}
                    />
                </div>
                </>
            ) : (
                <>
                <button disabled={saving} onClick={() => setBeingEdited(true)}>Edit</button>
                <h1>{dynRecipe.name}</h1>
                </>
            )
        }
        <h2>{dynRecipe.creator.name}</h2>
        <h2>{dynRecipe.updatedAt.toISOString()}</h2>
        <div className="flex flex-row">
            <Image className="w-2/5 h-fit" width="0" height="0" src={recipeImage} alt="Recipe cover image"/>
            <div className="flex flex-col w-full">
                <div>
                    <h3>Ingredients</h3>
                    <ul className="text-center">
                        <IngredientsDisplay 
                            ingredients={dynRecipe.ingredients}
                            setIngredients={setIngredients}
                            beingEdited={beingEdited}/>
                    </ul>
                </div>
                <BulkIngredientEditor 
                    display={beingEdited}
                    ingredients={dynRecipe.ingredients}
                    setIngredients={setIngredients}
                />
                
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

export default RecipeDisplay;