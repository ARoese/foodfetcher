"use client";
import { PlanDay } from "@prisma/client";

import type { DeepPlanDay } from "./PlanContainer";
import { useDroppable } from "@dnd-kit/core";
import RecipeSmallItem from "../browse/RecipeSmallItem";
type args = {day : DeepPlanDay, editing : boolean, setDay : (day : DeepPlanDay) => void};

function DayContainer({day, setDay, editing} : args) {
    // TODO: allow duplicate recipes by abstracting recipe to a
    // countedRecipe. Then, use a counter thing that gets added
    // to whenever there are duplicates
    const {setNodeRef} = useDroppable({
        id: `${day.planId} ${day.dayName}`,
        data: {
          accepts: ['recipe'],
          setDay
        },
    });

    function makeDelRecipe(i : number) {
        return () => {
            //console.log(`Deleting recipe ${i}`);
            setDay({
                ...day,
                recipes: day.recipes.toSpliced(i, 1)
            });
        }
    }

    return ( 
        <>
        <div ref={setNodeRef} className="flex-1 mx-2">
            <h1>{day.dayName}</h1>
            <div className="flex flex-col border-black border-2 min-h-48">
                {
                    day.recipes.map(
                        (recipe, i) => <RecipeSmallItem 
                                            key={`${recipe.id} ${i}`}
                                            className="my-2" 
                                            recipe={recipe}
                                            onClick={editing ? makeDelRecipe(i) : null}
                                        />
                    )
                }
                {/* TODO: add draggable smallRecipe components here? */}
            </div>
        </div>
        </>
     );
}

export default DayContainer;