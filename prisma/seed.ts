import { PrismaClient, Recipe } from "@prisma/client";
const prisma = new PrismaClient();

const sampleIngredients = [
    "garlic", "ginger", "soy sauce", "flour", "lemon juice", "baking soda", 
    "cream of mushroom", "milk", "vinegar", "salt", "sugar", "brown sugar"
];

const sampleMeasureSymbols = [
    "mL", "lb", "L", "tsp", "tbsp", "mg", null, "floz", "cup", "pinch", "dash"
]

async function addIngredients(){
    await prisma.ingredient.createMany({
        data: sampleIngredients.map((name) => Object({name: name}))
    });
}

function getRandomElement<T>(arr : T[]) : T{
    return arr[Math.floor(Math.random()*arr.length)];
}

function getRandomSlice<T>(arr : T[], n : number) : T[]{
    // https://stackoverflow.com/a/46545530
    const unshuffled = [...arr];
    let shuffled = unshuffled
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    
    return shuffled.slice(0, n);
    
}

type PartialIngredient = {ingredientName: string, amount: number, measureSymbol: string};
function getRandomIngredients(n : number) : PartialIngredient[]{
    return getRandomSlice(sampleIngredients, n)
        .map(
            (ingredient) => Object(
                {
                    ingredientName: ingredient,
                    amount: Math.random()*10,
                    measureSymbol: getRandomElement(sampleMeasureSymbols)
                }
            )
        );
}

async function main(){
    const user1 = await prisma.user.create({
        data: 
            {
                name: "devUser1"
            }
    });
    const user2 = await prisma.user.create({
        data: 
            {
                name: "devUser2"
            }
    });

    addIngredients();

    for (const num in [...Array(10).keys()]){
        await prisma.recipe.create({
            data: {
                creatorId: user1.id,
                name: `recipe ${num}`,
                instructions: `Sample instructions for recipe ${num}`,
                ingredients: {
                    create: getRandomIngredients(6)
                }
            }
        });
        await prisma.recipe.create({
            data: {
                creatorId: user2.id,
                name: `recipe ${num}`,
                instructions: `Sample instructions for recipe ${num}`,
                ingredients: {
                    create: getRandomIngredients(6)
                }
            }
        });
    }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })