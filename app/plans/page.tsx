"use server";

import SmallPageContainer from "../components/SmallPageContainer";
import { auth } from "@/auth";
import PlansDisplay from "./PlansDisplay";
import { getFavorites } from "@/lib/db/favorites";
import { getMealPlans } from "@/lib/db/plans";
import { getOwnRecipes } from "@/lib/db/recipes";
import { redirect } from "next/navigation";
import wrappedAction from "@/lib/wrappedAction-server";

export async function generateMetadata() {
    return {
        title: "Food Fetchers | Meal plans"
    }
}

async function MealPlanPage() {
    const session = await auth();
    if(!session){
        redirect("api/auth/signin");
    }

    // this is a deep get all the way down to every recipe included
    // this is so that we can just rely on it all being present in children
    // components
    // TODO: this get could be more lazy, but only if it's actually a problem. (it probably isn't)
    const [favorites, ownRecipes, plans] = await Promise.all([
        wrappedAction(getFavorites()),
        wrappedAction(getOwnRecipes()),
        wrappedAction(getMealPlans())
    ]);

    return ( 
        <SmallPageContainer>
            <h1>Meal plans</h1>
            
            <PlansDisplay plans={plans} userId={+session.user.id} favorites={favorites} ownRecipes={ownRecipes}/>
        </SmallPageContainer>
     );
}

export default MealPlanPage;