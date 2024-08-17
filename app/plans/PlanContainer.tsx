"use client";
import type {DeepPlan} from "@/app/dbLib"
import DayContainer from "./DayContainer";
import { Recipe } from "@prisma/client";
import { ChangeEventHandler } from "react";

export type DeepPlanDay = DeepPlan["days"][number];
type args = {plan : DeepPlan, editing : boolean, setPlan : (plan : DeepPlan) => void}
function Plan({plan, setPlan, editing} : args) {
    //console.log(plan);
    // TODO: may need to add a prop-based refresh here
    function makeSetDay(i : number) : (day : DeepPlanDay) => void {
        return (day : DeepPlanDay) => {
            //console.log(`setting day ${i}`, day);
            setPlan({
                ...plan,
                // get a little deep here, but change the days 
                // member of the plan to update the recipes
                days: plan.days.with(i, day)
            });
        }
    }

    const onEditName : ChangeEventHandler<HTMLInputElement> = (e) => {
        setPlan({
            ...plan,
            name: e.target.value
        });
    }

    return ( 
        <>
        {
            editing
            ? <input className="text-center mx-auto" value={plan.name} onChange={onEditName}/>
            : <h2>{plan.name}</h2>
        }
        <div className="flex flex-row">
            {
                plan.days.map(
                    (day, i) => (
                    <>
                    <DayContainer 
                        key={day.dayName}
                        day={day}
                        setDay={makeSetDay(i)}
                        editing={editing}/>
                    </>
                    )
                )
            }
        </div>
        </>
     );
}

export default Plan;