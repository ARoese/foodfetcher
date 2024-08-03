import SmallPageContainer from "@/app/components/SmallPageContainer";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import RecipeDisplay from "./RecipeDisplay";

const prisma = new PrismaClient();

export async function generateMetadata({params: {recipeid}}) : Promise<Metadata> {
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
    recipeid = Number(recipeid);
    if(Number.isNaN(recipeid)){
        notFound();
    }

    const recipe = await prisma.recipe.findUnique({
        where: {
            id: recipeid
        },
        include:{
            creator: {
                select: {
                    name: true
                }
            },
            ingredients: true
        },
    });

    if (!recipe){
        notFound();
    }

    return ( 
        <SmallPageContainer>
            <RecipeDisplay recipe={recipe}/>
        </SmallPageContainer>
     );
}

export default RecipeDisplayPage;