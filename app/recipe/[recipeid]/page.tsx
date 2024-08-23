import SmallPageContainer from "@/app/components/SmallPageContainer";
import { IngredientEntry, Prisma, PrismaClient, Recipe, User } from "@prisma/client";
import { notFound, useRouter } from "next/navigation";
import { Metadata } from "next";
import RecipeDisplay from "./RecipeDisplay";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { signIn } from "next-auth/react";
import { hasFavorited } from "@/lib/db/favorites";
import { getCurrentUser, getCurrentUserOrLogin } from "@/lib/db/user";

const prisma = new PrismaClient();

type RecipeWithRelations = Prisma.RecipeGetPayload<{
    include: {
        creator: {
            select: {
                name: true
            }
        },
        ingredients: true
    }
}>

export async function generateMetadata({params: {recipeid}}) : Promise<Metadata> {
    if(recipeid == "create"){
        return {
            title: "Food Fetchers | Create Recipe"
        }
    }
    recipeid = Number(recipeid);
    let title = "Food Fetchers | View Recipe";
    if(Number.isNaN(recipeid)){
        return {
            title
        }
    }

    const recipe = await prisma.recipe.findUnique({
        where: {
            id: recipeid
        },
        select: {
            name: true
        }
    });

    if(recipe){
        title = `Food Fetchers | ${recipe.name}`;
    }

    return {
        title
    };
}

async function RecipeDisplayPage({params: {recipeid}}) {
    
    let creating = false;
    let recipe : Recipe & {creator: {name: string}, ingredients: IngredientEntry[]} = undefined;
    const currentUser = await (recipeid == "create" ? getCurrentUserOrLogin() : getCurrentUser());

    if(recipeid == "create"){
        creating = true;
        recipe = {
            id: undefined,
            creatorId: currentUser.id,
            creator: currentUser,
            ingredients: [],
            createdAt: undefined,
            updatedAt: undefined,
            imageFile: undefined,
            videoFile: undefined,
            instructions: "",
            name: "New Recipe",
        }
    }else{
        recipeid = Number(recipeid);
        if(Number.isNaN(recipeid)){
            notFound();
        }

        recipe = await prisma.recipe.findUnique({
            where: {
                id: recipeid
            },
            include:{
                creator: {
                    select: {
                        name: true
                    }
                },
                ingredients: {
                    orderBy: {
                        sortIndex: 'asc'
                    }
                }
            },
        });
    }

    if (!recipe){
        notFound();
    }

    const canEdit = creating || currentUser !== null && recipe.creatorId == currentUser.id;
    const isFavorited = recipe.id ? await hasFavorited(recipe.id) : false;
    const preferredSystem = currentUser?.preferredMeasureSystem ?? "imperial";
    return ( 
        <SmallPageContainer>
            <RecipeDisplay 
                recipe={recipe}
                creatingNew={creating}
                canEdit={canEdit}
                isFavorited={isFavorited}
                isLoggedIn={Boolean(currentUser)}
                // we know that this system coming from the database is a valid string
                // @ts-ignore
                preferredSystem={preferredSystem}
            />
        </SmallPageContainer>
     );
}

export default RecipeDisplayPage;