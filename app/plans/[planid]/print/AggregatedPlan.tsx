import { FullPlan } from "@/lib/db/plans";
import { aggregateDays, toBestUnit } from "../../../../lib/ingredientAggregations";
import { IngredientEntry } from "@prisma/client";
import IngredientsDisplay from "@/app/recipe/[recipeid]/IngredientsDisplay";
import { toIngredientTextGroups } from "@/lib/ingredientTools";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


function AggregatedPlan({plan} : {plan : FullPlan}) {
    //allUnits.map((u) => console.log(u));
    //console.log(allUnits);
    //console.log(plan)
    const aggregated : IngredientEntry[] = aggregateDays(plan.days).map(toBestUnit);
    //console.log(aggregated);
    const aggregatedText = aggregated.map(toIngredientTextGroups).map(({full}) => full);
    return ( 
        <>
        <h1>{plan.name}</h1>
        <div className="grid grid-cols-2">
        {
            aggregatedText.map(
                (text, i) => (
                    <div className="flex flex-row w-full my-1" key={i}>
                        {/*<FontAwesomeIcon className="w-3 mr-2" icon={faSquare}/>*/}
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