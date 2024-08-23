"use client";
import PlanContainer from "./PlanContainer";
import { useState } from "react";
import { Plan, Recipe } from "@prisma/client"
import { toast } from "react-toastify";
import DraggableRecipeList from "./DraggableRecipeList";
import Select from 'react-select';
import {default as CreatableSelect} from 'react-select/creatable';
import { DndContext, DragOverlay } from "@dnd-kit/core";
import RecipeSmallItem from "../browse/RecipeSmallItem";
import Link from "next/link";
import { DeepPlan, newMealPlan, deleteMealPlan, updatePlan } from "@/lib/db/plans";
const deepEqual = require("deep-equal");

type args = {plans : DeepPlan[], userId : number, favorites : Recipe[], ownRecipes : Recipe[]};
// TODO: clean this up and modularize stuff
function PlansDisplay({plans, userId, favorites, ownRecipes} : args) {
    const sourceGroups = [
        {value: favorites, label: "Favorites"},
        {value: ownRecipes, label: "Owned"}
    ]
    const [editing, setEditing] = useState(false);
    const [dynPlans, setDynPlans] = useState(plans);
    const dynPlansOptions = dynPlans.map(
        (plan, i) => ({value: i, label: plan.name})
    );
    const [recipeSource, setRecipeSource] = useState(sourceGroups[0]);
    const [planIndex, setPlanIndex] = useState(dynPlansOptions.length != 0 ? dynPlansOptions[0] : null);
    if(planIndex != null && (planIndex.value < 0 || planIndex.value >= dynPlansOptions.length)){
        setPlanIndex(dynPlansOptions.length != 0 ? dynPlansOptions[0] : null);
    }
    const [draggingRecipe, setDraggingRecipe] = useState(null);
    //console.log(favorites, ownRecipes);

    
    async function addPlan(name : string){
        // this makes a new plan in the database
        // eagerly--it doesn't wait for everything to be done
        // before making the push to db
        // clicking the plus = new plan exists in DB
        setDynPlans(
            [
                ...dynPlans, 
                await newMealPlan(userId, name)
            ]
        );
    }

    async function deletePlan(i : number){
        if(!window.confirm(`Delete '${dynPlans[i].name}'?`)){
            return;
        }

        async function tryDelete(){
            await deleteMealPlan(dynPlans[i].id);
            // only update here on the client when we're sure the
            // db remove was successful
            setDynPlans(
                dynPlans.toSpliced(i, 1)
            );
        }

        toast.promise(tryDelete(), {
            pending: "Deleting plan...",
            success: "Deleted plan",
            error: "Failed to delete plan"
        });
    }

    function makeUpdatePlan(i : number) : (plan : DeepPlan) => void{
        // return a closure around setDynPlans with the index pre-set
        return (plan : DeepPlan) => {
            setPlanIndex({...planIndex, label: plan.name});
            setDynPlans(dynPlans.with(i, plan));
        }
    }

    function handleDragEnd(event){
        //setDraggingRecipe(null);
        const {active, over} = event;
        if(!over){
            return;
        }
        console.log(active, over);
        const [planId, dayName] = over.id.split(" ");
        const targetPlanIndex = dynPlans.findIndex((plan) => plan.id == +planId);
        const targetDayIndex = dynPlans[targetPlanIndex].days.findIndex((day) => day.dayName == dayName);
        const numQRecipesInDay = dynPlans[targetPlanIndex].days[targetDayIndex].quantRecipes.length;
        // this makes things much more convenient than a massively nested series of spreads and withs
        const newDynPlans = structuredClone(dynPlans);
        const quantRecipeIndex = dynPlans[targetPlanIndex].days[targetDayIndex].quantRecipes.findIndex((qr) => qr.recipeId == active.data.current.id);
        // TODO: map this new qRecipe id into a negative number and map that id to null?
        if(quantRecipeIndex != -1){
            newDynPlans[targetPlanIndex].days[targetDayIndex].quantRecipes[quantRecipeIndex].quantity++;
        }else{
            newDynPlans[targetPlanIndex].days[targetDayIndex].quantRecipes[numQRecipesInDay] = {
                id: -numQRecipesInDay,
                quantity: 1,
                recipeId: active.data.current.id,
                recipe: active.data.current
            };
        }
        
        setDynPlans(
            newDynPlans
        );
        
    }

    async function onClickEdit(){
        if(!editing){
            setEditing(true);
            return;
        }

        const toUpdate = dynPlans.filter(
            (dynPlan, i) => !deepEqual(dynPlan, plans[i])
        );
        
        if(toUpdate.length == 0){
            toast.info("No changes to save");
            setEditing(false);
            return;
        }

        const updatingPromise = Promise.all(toUpdate.map(updatePlan));
        var wasError : Boolean  = false;
        await toast.promise(updatingPromise, {
            pending: `Updating ${toUpdate.length} plans...`,
            error: {
                render: (e) => {
                    const error = e.data as Error;
                    console.log(e);
                    wasError = true;
                    return `Failed to save plans: ${error.message}`;
                }
            },
            success: `Updated ${toUpdate.length} plan${toUpdate.length > 1 ? "s" : ""}.`
        });

        if(wasError){
            return;
        }

        setEditing(false);
    }

    //console.log(draggingRecipe);

    return ( 
        <DndContext autoScroll={false}
            onDragStart={(event) => {setDraggingRecipe(event.active.data.current)}}
            onDragEnd={handleDragEnd}
        >
        <DragOverlay dropAnimation={null} >
            {
                draggingRecipe
                ? <RecipeSmallItem className="max-w-40 min-w-40 mx-2" recipe={draggingRecipe}/>
                : ""
            }
        </DragOverlay>
        
        <div className="mx-auto flex flex-row relative m-2">
            <CreatableSelect
                onChange={setPlanIndex}
                value={planIndex}
                className="w-fit min-w-64 mx-auto" 
                options={dynPlansOptions}
                onCreateOption={async (n) => {
                    await addPlan(n);
                    setEditing(true);
                    setPlanIndex({value: dynPlansOptions.length, label: n});
                    }
                }
                createOptionPosition="last"
            />
            <button className="absolute left-0" onClick={onClickEdit}>{editing ? "Save" : "Edit"}</button>
            {
                editing
                ? <button className="text-red-700 absolute right-0" onClick={async () => await deletePlan(planIndex.value)}>Delete</button>
                : (
                    planIndex &&
                    <Link href={`/plans/${dynPlans[planIndex.value].id}/print`}>
                        <button className="absolute right-0">Collect Ingredients</button>
                    </Link>
                )
            }
        </div>
        
        
        <div className="flex flex-col">
            {
                planIndex != null && 
                <PlanContainer plan={dynPlans[planIndex.value]} editing={editing} setPlan={makeUpdatePlan(planIndex.value)}/>
            }
        </div>
        

        {
            editing && 
            <>
            <h2>Select a list of recipes to drag from:</h2>
            <Select 
                isSearchable={false}
                onChange={setRecipeSource} 
                value={recipeSource} 
                className="w-fit mx-auto" 
                options={sourceGroups}/>
            <DraggableRecipeList recipes={recipeSource.value}/>
            </>
        }
        </DndContext>
    );
}

export default PlansDisplay;