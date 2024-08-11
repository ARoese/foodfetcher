"use client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PlanContainer from "./PlanContainer";
import { useState } from "react";
import { Plan } from "@prisma/client"
import { DeepPlan, deleteMealPlan, newMealPlan } from "../dbLib";
import { toast } from "react-toastify";

type args = {plans : DeepPlan[], userId : number};
function PlanDisplay({plans, userId} : args) {
    const [editing, setEditing] = useState(false);
    const [dynPlans, setDynPlans] = useState(plans);

    
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