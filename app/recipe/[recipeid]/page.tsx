import SmallPageContainer from "@/app/components/SmallPageContainer";
import { IngredientEntry, Prisma, PrismaClient, Recipe, User } from "@prisma/client";
import { notFound, useRouter } from "next/navigation";
import { Metadata } from "next";
import RecipeDisplay from "./RecipeDisplay";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { signIn } from "next-auth/react";

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

async function tryGetUser(){
    const session = await auth();
    if(!session){
        return null;
    }

    const userId = Number(session.user.id);

    return await prisma.user.findUnique({
        where: {
            id: userId
        },
        omit: { // do not get passhash and risk exposing it via errors
            passhash: true,
        }
    });
}

async function RecipeDisplayPage({params: {recipeid}}) {
    
    let creating = false;
    let recipe : Recipe & {creator: {name: string}, ingredients: IngredientEntry[]} = undefined;
    const currentUser = await tryGetUser();

    if(recipeid == "create" && !currentUser){
        signIn(); // no session but trying to create a recipe
    }

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

    return ( 
        <SmallPageContainer>
            <RecipeDisplay recipe={recipe} creatingNew={creating} canEdit={canEdit}/>
        </SmallPageContainer>
     );
}

export default RecipeDisplayPage;