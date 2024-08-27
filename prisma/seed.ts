import { PrismaClient } from "@prisma/client";
import { DAYS } from "./consts";
import { parseArgs } from "util";
const prisma = new PrismaClient();

const sampleIngredients = [
    "garlic", "ginger", "soy sauce", "flour", "lemon juice", "baking soda", 
    "cream of mushroom", "milk", "vinegar", "salt", "sugar", "brown sugar"
];

const sampleMeasureSymbols = [
    "mL", "lb", "L", "tsp", "tbsp", "mg", null, "floz", "cup", "pinch", "dash"
]

async function addWeekdays(){
    await prisma.weekday.createMany({
        data: DAYS.map((day) => ({name: day}))
    });
}

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

type PartialIngredient = {ingredientName: string, amount: number, measureSymbol: string, sortIndex: number};
function getRandomIngredients(n : number) : PartialIngredient[]{
    return getRandomSlice(sampleIngredients, n)
        .map(
            (ingredient, i) => Object(
                {
                    ingredientName: ingredient,
                    amount: Math.random()*10,
                    measureSymbol: getRandomElement(sampleMeasureSymbols),
                    sortIndex: i
                }
            )
        );
}

async function addFakeData(){
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

async function main(){
    const {values: {fake}} = parseArgs({
        args: process.argv,
        options: {
            fake: {
                type: "boolean",
                short: "f",
                default: false
            },
        },
        allowPositionals: true
    });

    addWeekdays(); // this is just creating an "enum" enforced by database constraints

    if(fake){
        console.log("Creating fake data");
        addIngredients();
        addFakeData();
    }else{
        console.log("Not creating fake data. Pass -f or --fake to generate fake recipes and dev users");
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