import type {DeepPlan} from "@/app/dbLib"
import DayContainer from "./DayContainer";
import { Recipe } from "@prisma/client";

export type DeepPlanDay = DeepPlan["days"][number];
type args = {plan : DeepPlan, setPlan : (plan : DeepPlan) => void}
function Plan({plan, setPlan} : args) {
    // TODO: may need to add a prop-based refresh here
    function makeSetDay(i : number) : (day : DeepPlanDay) => void {
        return (day : DeepPlanDay) => {
            setPlan({
                ...plan,
                // get a little deep here, but change the days 
                // member of the plan to update the recipes
                days: plan.days.with(i, day)
            });
        }
    }
    return ( 
        <>
        {/* <h1>{plan.name}</h1> */}
        <div className="flex flex-row">
            {
                plan.days.map(
                    (day, i) => (
                    <>
                    <DayContainer 
                        key={day.dayName}
                        day={day}
                        setDay={makeSetDay(i)}/>
                    </>
                    )
                )
            }
        </div>
        </>
     );
}

export default Plan;