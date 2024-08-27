import SmallPageContainer from "@/app/components/SmallPageContainer";
import { getMealPlan } from "@/lib/db/plans";
import { notFound, redirect } from "next/navigation";
import AggregatedPlan from "./AggregatedPlan";
import { getCurrentUserOrLogin } from "@/lib/db/user";
import wrappedAction from "@/lib/wrappedAction-server";

async function PrintPlan({params: {planid}} : {params: {planid : string}}) {
    const parsedPlanId = parseInt(planid);

    if(isNaN(parsedPlanId)){
        return notFound();
    }

    const currentUser = await getCurrentUserOrLogin();
    const plan = await wrappedAction(getMealPlan(parsedPlanId));

    // we know these strings coming from the db will be a valid unit system
    // @ts-ignore
    const preferredSystem : "imperial" | "metric" = currentUser.preferredMeasureSystem;

    return ( 
        <SmallPageContainer>
            <AggregatedPlan plan={plan} preferredSystem={preferredSystem}/>
        </SmallPageContainer>
     );
}

export default PrintPlan;