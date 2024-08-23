"use server";

import { auth } from "@/auth";
import { DAYS } from "@/prisma/consts";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// make sure these two match
export type DeepPlan = Prisma.PlanGetPayload<{
    include: {
        days: {
            include: {
                weekday: true,
                quantRecipes: {
                    include: {
                        recipe: true,
                        quantity: true
                    }
                }
            }
        }
    }
}>;

const deepPlanInclude = {
    days: {
        include: {
            weekday: true,
            quantRecipes: {
                include: {
                    recipe: true
                }
            }
        }
    }
}

// make sure these two match
export type FullPlan = Prisma.PlanGetPayload<{
    include: {
        days: {
            include: {
                weekday: true,
                quantRecipes: {
                    include: {
                        recipe: {
                            include: {
                                ingredients: true
                            }
                        },
                        quantity: true
                    }
                }
            }
        }
    }
}>;

const fullPlanInclude = {
    days: {
        include: {
            weekday: true,
            quantRecipes: {
                include: {
                    recipe: {
                        include: {
                            ingredients: true
                        }
                    }
                }
            }
        }
    }
}

export async function updatePlan(plan : DeepPlan) : Promise<void> {
    if(!plan.name.trim()){
        throw new Error("Plans cannot have empty names.");
    }
    await prisma.plan.update({
        where: {
            id: plan.id
        },
        data: {
            name: plan.name,
            days: {
                deleteMany: {},
                create: plan.days.map((day) => ({
                    weekday: {
                        connect: {
                            name: day.dayName
                        }
                    },
                    quantRecipes: {
                        create: day.quantRecipes.map((quantRecipe) => ({
                            quantity: quantRecipe.quantity,
                            recipe: {
                                connect: {
                                    id: quantRecipe.recipeId
                                }
                            }
                        }))
                    }
                }))
            }
        }
    });
}

function sortPlanDays(plan : DeepPlan){
    // sort the days by their names so that the days are in 
    // the same order as they appear in this global DAYS array
    plan.days.sort((a, b) => DAYS.indexOf(a.dayName) - DAYS.indexOf(b.dayName));
}

export async function getMealPlan(planid : number) : Promise<FullPlan|null>{
    const session = await auth();
    if(session == null){
        throw new Error("You are not logged in");
    }

    const plan = await prisma.plan.findUnique({
        where: {
            id: planid,
            owningUserId: +session.user.id
        },
        include: fullPlanInclude
    });

    sortPlanDays(plan);

    return plan;
}

export async function getMealPlans() : Promise<DeepPlan[]> {
    const session = await auth();
    if(session == null){
        throw new Error("You are not logged in");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: +session.user.id
        },
        include: {
            plans: {
                include: deepPlanInclude,
                orderBy: {
                    id: "asc"
                }
            }
        }
    });

    user.plans.forEach(sortPlanDays);
    
    console.log(user);
    return user.plans;
}

export async function newMealPlan(userId : number, name : string) : Promise<DeepPlan> {
    // TODO: protect this
    const newPlan = await prisma.plan.create({
        data: {
            name: name,
            days: {
                // always make a relational for each day in the week
                createMany: {
                    data: DAYS.map((day) => ({dayName: day}))
                }
            },
            owningUser: {
                connect: {
                    id: userId
                }
            }
        },
        include: deepPlanInclude
    });

    sortPlanDays(newPlan);
    return newPlan;
}

export async function deleteMealPlan(planId : number){
    // TODO: protect this
    await prisma.plan.delete({
        where: {
            id: planId
        }
    });
}