import SmallPageContainer from "@/app/components/SmallPageContainer";
import { Prisma, PrismaClient } from "@prisma/client";
import { notFound, useRouter } from "next/navigation";
import { Metadata } from "next";
import RecipeDisplay from "./RecipeDisplay";
import { revalidatePath } from "next/cache";

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