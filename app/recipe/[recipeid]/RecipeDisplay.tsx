"use client";

import { useState } from "react";
import { IngredientEntry, PrismaClient, type Prisma } from "@prisma/client";
import { useRouter } from 'next/navigation'
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
import { setFavorite } from "@/lib/db/favorites";
import { updateRecipe, deleteRecipe } from "@/lib/db/recipes";
import FileUploads from "./FileUploads";
import wrappedAction from "@/lib/wrappedAction";

type args = {
    recipe: RecipeWithRelations,
    creatingNew : boolean,
    canEdit : boolean,
    isFavorited : boolean,
    isLoggedIn : boolean,
    preferredSystem : "imperial" | "metric"
};

/** Facilitates viewing and editing of a single recipe */
function RecipeDisplay({recipe, creatingNew = false, canEdit = false, isFavorited, isLoggedIn, preferredSystem} : args) {
    const [cancelRecipe, setCancelRecipe] = useState(recipe);
    const [dynRecipe, setDynRecipe] = useState(recipe);
    const [beingEdited, setBeingEdited] = useState(creatingNew);
    const [saving, setSaving] = useState(false);
    const [favorited, setFavorited] = useState(isFavorited);
    const router = useRouter();

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
            
            // update the recipe in the db
            // if we are creating, we want to redirect to the view page of that recipe
            // so that we don't stay on the create page after the recipe exists.
            // This would prevent people from trying to share their newly created recipe and
            // instead sharing the create page
            const promise = wrappedAction(updateRecipe(dynRecipe))
                            .then((recipe) => creatingNew ? router.push(`./${recipe.id}`) : null);
            
            try{
                await toast.promise(promise, {
                        pending: "Saving recipe",
                        success: "Saved recipe",
                        error: {
                            render: (e) => {
                                const error = e.data as Error;
                                console.log(e);
                                return `Failed to save recipe: ${error.message}`;
                            }
                        },
                    }, 
                    {
                        autoClose: 10000
                    },
                ).then(() => {
                    setBeingEdited(false);
                    setCancelRecipe(dynRecipe);
                });
            }catch{}
        }

        if(!dynRecipe.ingredients.every((ingredient) => ingredient.amount != 0)){
            toast.error("One or more of your ingredients are invalid because the amount is 0. Fix them before submitting.");
            return;
        }

        
        setSaving(true); // let everything know we're saving so they lock down
        // TODO: go back to editing if the save fails for any reason
        // this should keep the current values that failed to save
        // so they can be tried again or modified
        await doSave(); 
        // ensure bulk edit stays consistent
        setSaving(false);
    }

    async function handleDeleteRecipe(){
        if(!window.confirm("Delete recipe?")){
            return;
        }

        deleteRecipe(dynRecipe.id);
        router.push("/");
    }

    async function clickFavorite(){
        // TODO: add toast?
        await setFavorite(dynRecipe.id, !favorited);
        setFavorited(!favorited);
    }

    return ( 
        <>
        {
            beingEdited
            ? (
                <>
                <div className="flex flex-row">
                    <button onClick={async () => await handleSaveRecipe()}>Save</button>
                    {
                        !creatingNew &&
                        <>
                        <button onClick={() => {setDynRecipe(cancelRecipe); setBeingEdited(false)}}>Cancel</button>
                        <button className="text-red-800 ml-auto" onClick={async () => await handleDeleteRecipe()}>Delete</button>
                        </>
                    }
                </div>
                <div className="mx-auto text-center">
                    <input className="text-center"
                        value={dynRecipe.name} 
                        minLength={20}
                        onChange={(e) => setDynRecipe({...dynRecipe, name: e.target.value})}
                    />
                </div>
                </>
            ) : (
                <>
                {canEdit ? <button disabled={saving} onClick={() => setBeingEdited(true)}>Edit</button> : ""}
                {
                    dynRecipe.id != null && dynRecipe.id != undefined && isLoggedIn
                    ?
                        favorited
                        ? <button onClick={clickFavorite}>Remove Favorite</button>
                        : <button onClick={clickFavorite}>Favorite</button>
                    : ""
                }
                
                <h1>{dynRecipe.name}</h1>
                </>
            )
        }
        <h2>{dynRecipe.creator.name}</h2>
        <h2>{dynRecipe.updatedAt ? dynRecipe.updatedAt.toISOString() : ""}</h2>
        <div className="flex flex-row">
            <div className="max-w-2/5 h-fit">
                <FileUploads 
                    beingEdited={beingEdited}
                    imageFile={dynRecipe.imageFile}
                    videoFile={dynRecipe.videoFile}
                    /* !!not the same function! note structuring assignment with names */
                    setImageFile={(imageFile : string) => setDynRecipe({...dynRecipe, imageFile})}
                    setVideoFile={(videoFile : string) => setDynRecipe({...dynRecipe, videoFile})}
                />
            </div>
            
            <div className="flex flex-col w-full">
                <div>
                    <h3>Ingredients</h3>
                    <ul className="text-center">
                        <IngredientsDisplay 
                            ingredients={dynRecipe.ingredients}
                            setIngredients={setIngredients}
                            beingEdited={beingEdited}
                            preferredSystem={preferredSystem}
                        />
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
                            placeholder="Instructions on how to make your recipe"
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