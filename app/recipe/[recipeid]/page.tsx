import SmallPageContainer from "@/app/components/SmallPageContainer";
import recipeImage from "@/public/images/logo.png";
import Image from "next/image";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import IngredientsDisplay from "./IngredientsDisplay";

const prisma = new PrismaClient();

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
            }
        }
    });

    if (!recipe){
        notFound();
    }

    return ( 
        <SmallPageContainer>
            <h1>{recipe.name}</h1>
            <h2>{recipe.creator.name}</h2>
            <div className="flex flex-row">
                <Image className="w-2/5" width="0" height="0" src={recipeImage} alt="Recipe cover image"/>
                <div className="flex flex-col w-full">
                    <div>
                        <h3>Ingredients</h3>
                        <IngredientsDisplay ingredients={[...Array(5).keys()]}/>
                    </div>
                    <hr className="border-black border-2"/>
                    <div>
                        <h3>Instructions</h3>
                        <p>{recipe.instructions}</p>
                    </div>
                </div>
            </div>
            
        </SmallPageContainer>
     );
}

export default RecipeDisplayPage;