"use client";

import Image from "next/image";
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
import { FileUploader } from "react-drag-drop-files";
import { setMedia } from "@/lib/media";
import recipeImageJsx from "@/app/recipeUtil";
import UploadCover from "./UploadCover";
import { setFavorite } from "@/lib/db/favorites";
import { updateRecipe, deleteRecipe } from "@/lib/db/recipes";

type args = {
    recipe: RecipeWithRelations,
    creatingNew : boolean,
    canEdit : boolean,
    isFavorited : boolean,
    isLoggedIn : boolean
};

/** Facilitates viewing and editing of a single recipe */
function RecipeDisplay({recipe, creatingNew = false, canEdit = false, isFavorited, isLoggedIn} : args) {
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
            const promise = updateRecipe(dynRecipe)
                            .then((recipe) => creatingNew ? router.push(`./${recipe.id}`) : null);
            
            await toast.promise(promise, {
                    pending: "Saving recipe",
                    success: "Saved recipe",
                    error: "Failed to save recipe",
                }, 
                {
                    autoClose: 10000
                },
            );
        }

        if(!dynRecipe.ingredients.every((ingredient) => ingredient.amount != 0)){
            toast.error("One or more of your ingredients are invalid because the amount is 0. Fix them before submitting.");
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

    async function handleImageUpload(file : File){
        console.log(file);
        const d = new FormData();
        d.append("image", file);
        const remoteName = await setMedia(file.name, "image", d);
        setDynRecipe({
            ...dynRecipe,
            imageFile: remoteName
        });
    }

    async function handleVideoUpload(file : File){
        console.log(file);
        const d = new FormData();
        d.append("video", file);
        const remoteName = await setMedia(file.name, "video", d);
        setDynRecipe({
            ...dynRecipe,
            videoFile: remoteName
        });
    }

    //console.log(dynRecipe.imageFile);
    // TODO: break this out into some sub-components
    return ( 
        <>
        {
            beingEdited
            ? (
                <>
                <div className="flex flex-row">
                    <button onClick={async () => await handleSaveRecipe()}>Save</button>
                    <button onClick={() => {setDynRecipe(cancelRecipe); setBeingEdited(false)}}>Cancel</button>
                    <button className="text-red-800 ml-auto" onClick={async () => await handleDeleteRecipe()}>Delete</button>
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
            <div className="w-2/5 h-fit">
            {
                beingEdited
                ? (
                    <>
                    <FileUploader 
                        label="Drop an image here"
                        handleChange={handleImageUpload}
                    >
                        <div className="relative">
                            {recipeImageJsx(dynRecipe)}
                            <UploadCover 
                                text={"Upload recipe image"}
                                className="absolute inset-0 bg-white bg-opacity-60"
                            />
                        </div>
                    </FileUploader>
                    <FileUploader
                        label="Drop a video here"
                        handleChange={handleVideoUpload}
                    >
                        <div className="relative">
                            { // Same thing but without controls. This allows a click without play
                                dynRecipe.videoFile 
                                ? <video width="100%" className="max-w-fit" src={`/media/video/${dynRecipe.videoFile}`}>
                                    Your browser does not support the video tag
                                </video>
                                : <div className="min-w-fit min-h-60 bg-gray-400">
                                    <p className="my-auto">Drop a video file here</p>
                                </div>
                            }
                            <UploadCover 
                                text={"Upload recipe video"}
                                className="absolute inset-0 bg-white bg-opacity-60"
                            />
                        </div>
                    </FileUploader>
                    </>
                ) : (
                    <>
                    {recipeImageJsx(dynRecipe)}
                    {
                        dynRecipe.videoFile &&
                        <video controls width="100%" className="max-w-fit" src={`/media/video/${dynRecipe.videoFile}`}>
                            Your browser does not support the video tag
                        </video>
                    }
                    </>
                    
                )
            }
            </div>
            
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