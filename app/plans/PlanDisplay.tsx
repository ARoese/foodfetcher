"use client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PlanContainer from "./PlanContainer";
import { useState } from "react";
import { Plan, Recipe } from "@prisma/client"
import { DeepPlan, deleteMealPlan, newMealPlan } from "../dbLib";
import { toast } from "react-toastify";
import DraggableRecipeList from "./DraggableRecipeList";
import Select from 'react-select';

type args = {plans : DeepPlan[], userId : number, favorites : Recipe[], ownRecipes : Recipe[]};
function PlanDisplay({plans, userId, favorites, ownRecipes} : args) {
    const sourceGroups = [
        {value: favorites, label: "Favorites"},
        {value: ownRecipes, label: "Owned"}
    ]
    const [editing, setEditing] = useState(false);
    const [dynPlans, setDynPlans] = useState(plans);
    const [recipeSource, setRecipeSource] = useState(sourceGroups[0]);
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

    

    return ( 
        <>
        <button onClick={() => setEditing(!editing)}>{editing ? "Stop Editing" : "Edit"}</button>
        { /* TODO: hide if empty */
            editing && 
            <>
            <h2>Select a recipes list:</h2>
            <Select isSearchable={false} onChange={(newVal) => setRecipeSource(newVal)} value={recipeSource} className="w-fit mx-auto" options={sourceGroups}/>
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
                        <PlanContainer plan={plan} setPlan={makeUpdatePlan(i)}/>
                        
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
        
        </>
    );
}

export default PlanDisplay;