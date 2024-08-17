"use client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PlanContainer from "./PlanContainer";
import { useState } from "react";
import { Plan, Recipe } from "@prisma/client"
import { DeepPlan, deleteMealPlan, newMealPlan, updatePlan } from "../dbLib";
import { toast } from "react-toastify";
import DraggableRecipeList from "./DraggableRecipeList";
import Select from 'react-select';
import { DndContext, DragOverlay } from "@dnd-kit/core";
import RecipeSmallItem from "../browse/RecipeSmallItem";
const deepEqual = require("deep-equal");

type args = {plans : DeepPlan[], userId : number, favorites : Recipe[], ownRecipes : Recipe[]};
function PlanDisplay({plans, userId, favorites, ownRecipes} : args) {
    const sourceGroups = [
        {value: favorites, label: "Favorites"},
        {value: ownRecipes, label: "Owned"}
    ]
    const [editing, setEditing] = useState(false);
    const [dynPlans, setDynPlans] = useState(plans);
    const [recipeSource, setRecipeSource] = useState(sourceGroups[0]);
    const [draggingRecipe, setDraggingRecipe] = useState(null);
    //console.log(favorites, ownRecipes);

    
    async function addPlan(){
        // this makes a new plan in the database
        // eagerly--it doesn't wait for everything to be done
        // before making the push to db
        // clicking the plus = new plan exists in DB
        setDynPlans(
            [
                ...dynPlans, 
                await newMealPlan(userId)
            ]
        );
    }

    async function deletePlan(i : number){
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
        }

        const updatingPromise = Promise.all(toUpdate.map(updatePlan));
        var wasError : Boolean  = false;
        await toast.promise(updatingPromise, {
            pending: `Updating ${toUpdate.length} plans...`,
            error: {
                render: (e) => {
                    wasError = true;
                    return "Failed to save plans";
                }
            },
            success: "Changes saved"
        });

        if(wasError){
            return;
        }

        setEditing(false);
    }

    return ( 
        <DndContext 
            onDragStart={(event) => {setDraggingRecipe(event.active.data); console.log(event.active.data)}}
            onDragEnd={handleDragEnd}
        >
        <DragOverlay dropAnimation={{duration: 500}}>
            {
                draggingRecipe
                ? <RecipeSmallItem className="max-w-40 min-w-40 mx-2" recipe={draggingRecipe}/>
                : ""
            }
        </DragOverlay>
        <button onClick={onClickEdit}>{editing ? "Save" : "Edit"}</button>
        { /* TODO: hide if empty */
            editing && 
            <>
            <h2>Select a recipes list:</h2>
            <Select 
                isSearchable={false}
                onChange={(newVal) => setRecipeSource(newVal)} 
                value={recipeSource} 
                className="w-fit mx-auto" 
                options={sourceGroups}/>
            <DraggableRecipeList recipes={recipeSource.value}/>
            </>
        }
        
        {
            dynPlans.map(
                (plan, i) => (
                    <>
                    <div key={plan.id} className="flex flex-col">
                        <h2>{plan.name}</h2>
                        {
                            editing 
                            ? <button className="w-auto" onClick={async () => await deletePlan(i)}>Delete</button>
                            : ""
                        }
                        {/* TODO: accordian these */}
                        <PlanContainer plan={plan} editing={editing} setPlan={makeUpdatePlan(i)}/>
                        
                    </div>
                    
                    </>
                )
            )
        }
        {
            /* 
                If there are no plans, allow the add button to appear. When it is clicked,
                go into edit mode 
            */
            editing || dynPlans.length < 1
            ? <button 
                className="w-full" 
                onClick={
                    dynPlans.length > 0
                    ? async () => await addPlan()
                    : async () => {await addPlan(); setEditing(true)}
                    
                }>
                <FontAwesomeIcon icon={faPlus} />
            </button>
            : ""
        }
        </DndContext>
    );
}

export default PlanDisplay;