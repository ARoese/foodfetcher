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

    const moreFakeUsers = await prisma.user.createMany({
        data: [...Array(10).keys()].map(
            (i) => ({
                name: `testUser${i+1}`,
            })
        )
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

async function addAdmin(){
    // generate a random password for the admin account.
    // TODO: this is for later, when I can actually import my crypto functions
    // for making a password hash and use them in here
    const defaultAdminPassword : string = 
        [...Array(16).keys()]
            .map(_ => Math.floor(Math.random()*26))
            .map(code => String.fromCharCode(code))
            .map(char => Math.random() > 0.5 ? char.toUpperCase() : char)
            .join();

    const admin = await prisma.user.create({
        data:
            {
                name: "admin",
                admin: true
            }
    });

    console.log("YOU SHOULD NOT USE THIS DATABASE IN PRODUCTION!");
    console.log("The admin account 'admin' can be logged into with any password!");
}

async function main(){
    const {values: {fake, admin}} = parseArgs({
        args: process.argv,
        options: {
            fake: {
                type: "boolean",
                short: "f",
                default: false
            },
            admin: {
                type: "boolean",
                short: "a",
                defult: false
            }
        },
        allowPositionals: true
    });

    addWeekdays(); // this is just creating an "enum" enforced by database constraints

    if(fake){
        console.log("Creating fake data");
        await addIngredients();
        await addFakeData();
    }else{
        console.log("Not creating fake data. Pass -f or --fake to generate fake recipes and dev users");
    }

    if(admin){
        console.log("Creating a default admin account");
        await addAdmin();
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