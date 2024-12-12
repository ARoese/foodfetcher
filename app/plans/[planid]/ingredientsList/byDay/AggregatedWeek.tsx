import type { FullPlan } from "@/lib/db/plans";
import { aggregateDays, toBestUnit, type FullDay } from "@/lib/ingredientAggregations";
import { toIngredientTextGroups } from "@/lib/ingredientTools";
import { IngredientEntry } from "@prisma/client";

function AggregatedWeek({plan, preferredSystem} : {plan : FullPlan, preferredSystem : "imperial" | "metric"}) {
    return ( 
        <>
        <h1>{plan.name}</h1>
        <div className="grid grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3"
        >
        {
            plan.days
                .filter(day => day.quantRecipes.length != 0)
                .map(day => <AggregatedDay key={day.dayName} day={day} preferredSystem={preferredSystem} />)
        }
        </div>
        </>
     );
}

function AggregatedDay({day, preferredSystem} : {day : FullDay, preferredSystem : "imperial" | "metric"}) {
    const ingredients = aggregateDays([day]);
    const bestUnits : IngredientEntry[] = ingredients.map((i) => toBestUnit(i, preferredSystem));
    const aggregatedText = bestUnits.map(toIngredientTextGroups).map(({full}) => full);
    return ( 
        <div className="flex-1">
            <p className="text-center">{day.dayName}</p>
            <hr className="border-black border-2"/>
            {
                aggregatedText.map(
                    (text, i) => (
                        <div className="flex flex-row w-full my-1" key={i}>
                            <input type="checkbox" className=" mr-2 my-auto"/>
                            {text}
                        </div>
                    )
                )
            }
        </div> 
    );
}

export default AggregatedWeek;