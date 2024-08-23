import SmallPageContainer from "@/app/components/SmallPageContainer";
import { getMealPlan } from "@/lib/db/plans";
import { notFound } from "next/navigation";
import AggregatedPlan from "./AggregatedPlan";

async function PrintPlan({params: {planid}} : {params: {planid : string}}) {
    
    const parsedPlanId = parseInt(planid);
    //console.log(planid, parsedPlanId);
    if(isNaN(parsedPlanId)){
        return notFound();
    }

    const plan = await getMealPlan(parsedPlanId);

    return ( 
        <SmallPageContainer>
            <AggregatedPlan plan={plan}/>
        </SmallPageContainer>
     );
}

export default PrintPlan;