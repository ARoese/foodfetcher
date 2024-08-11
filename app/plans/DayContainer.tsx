import { PlanDay } from "@prisma/client";

import type { DeepPlanDay } from "./PlanContainer";
type args = {day : DeepPlanDay, setDay : (day : DeepPlanDay) => void};

function DayContainer({day, setDay} : args) {
    return ( 
        <>
        <div className="flex-1 mx-2">
            <h1>{day.dayName}</h1>
            <div className="flex flex-col border-black border-2 min-h-16">
                {/* TODO: add draggable smallRecipe components here */}
            </div>
        </div>
        </>
     );
}

export default DayContainer;