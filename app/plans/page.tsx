"use server";

import SmallPageContainer from "../components/SmallPageContainer";
import { auth, signIn } from "@/auth";
import { getMealPlans } from "../dbLib";
import PlanDisplay from "./PlanDisplay";

export async function generateMetadata() {
    return {
        title: "Food Fetchers | Meal plans"
    }
}

async function MealPlanPage() {
    const session = await auth();
    if(!session){
        signIn();
    }

    // this is a deep get all the way down to every recipe included
    // this is so that we can just rely on it all being present in children
    // components
    // TODO: this get could be more lazy, but only if it's actually a problem. (it probably isn't)
    const plans = await getMealPlans(+session.user.id);

    return ( 
        <SmallPageContainer>
            <h1>Meal plans</h1>
            <PlanDisplay plans={plans} userId={+session.user.id}/>
        </SmallPageContainer>
     );
}

export default MealPlanPage;