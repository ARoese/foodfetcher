import { FullPlan } from "@/lib/db/plans";
import { aggregateDays, toBestUnit } from "../../../../../lib/ingredientAggregations";
import { IngredientEntry } from "@prisma/client";
import IngredientsDisplay from "@/app/recipe/[recipeid]/IngredientsDisplay";
import { toIngredientTextGroups } from "@/lib/ingredientTools";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


function AggregatedPlan({plan, preferredSystem} : {plan : FullPlan, preferredSystem : "imperial" | "metric"}) {
    const aggregatedDays : IngredientEntry[] = aggregateDays(plan.days);

    const bestUnits : IngredientEntry[] = aggregatedDays.map((i) => toBestUnit(i, preferredSystem));

    const aggregatedText = bestUnits.map(toIngredientTextGroups).map(({full}) => full);
    return ( 
        <>
        <h1>{plan.name}</h1>
        <div className="grid grid-cols-1 
                        sm:grid-cols-2
                        lg:grid-cols-3"
        >
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
        </>
    );
}

export default AggregatedPlan;