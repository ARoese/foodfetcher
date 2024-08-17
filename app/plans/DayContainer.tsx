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

    function makeDecRecipe(i : number) {
        return () => {
            //console.log(`Deleting recipe ${i}`);
            // delete the quantRecipe if it would go to 0
            // otherwise, decrement the count
            const newDay = day.quantRecipes[i].quantity <= 1 
                ? {
                ...day,
                quantRecipes: day.quantRecipes.toSpliced(i, 1)
                } : {
                    ...day,
                    quantRecipes: day.quantRecipes.with(i, {
                        ...day.quantRecipes[i], 
                        quantity: day.quantRecipes[i].quantity-1
                    })
                };

            setDay(newDay);
        }
    }

    function makeIncRecipe(i : number) {
        return () => {
            //console.log(`Deleting recipe ${i}`);
            // delete the quantRecipe if it would go to 0
            // otherwise, decrement the count
            const newDay = {
                ...day,
                quantRecipes: day.quantRecipes.with(i, {
                    ...day.quantRecipes[i], 
                    quantity: day.quantRecipes[i].quantity+1
                })
            }

            setDay(newDay);
        }
    }

    return ( 
        <>
        <div ref={setNodeRef} className="flex-1 mx-2">
            <div className="h-full flex flex-col">
            <h1>{day.dayName}</h1>
            <div className="flex flex-col flex-1 border-black border-2 min-h-48">
                {
                    day.quantRecipes.map(
                        (recipeQuant, i) => (
                            <div key={`${recipeQuant.id} ${i}`} className="relative">
                                <RecipeSmallItem 
                                    newTab={true}
                                    className="my-2" 
                                    recipe={recipeQuant.recipe}
                                />
                                <div className="absolute top-0 left-0 text-black flex flex-row w-full">
                                    {
                                        editing && (
                                            <>
                                            <button onClick={makeIncRecipe(i)}>+</button>
                                            <button onClick={makeDecRecipe(i)}>-</button>
                                            </>
                                        )
                                    }
                                    
                                    <p className="ml-auto p-1 h-full bg-black text-white">x{recipeQuant.quantity}</p>
                                </div>
                                
                                
                            </div>
                            )
                    )
                }
                {/* TODO: add draggable smallRecipe components here? */}
            </div>
            </div>
        </div>
        </>
     );
}

export default DayContainer;