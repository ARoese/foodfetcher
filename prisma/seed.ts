import { PrismaClient, Recipe } from "@prisma/client";
const prisma = new PrismaClient();
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

    for (const num in [...Array(10).keys()]){
        await prisma.recipe.create({
            data: {
                creatorId: user1.id,
                name: `recipe ${num}`,
                instructions: `Sample instructions for recipe ${num}`
            }
        });
        await prisma.recipe.create({
            data: {
                creatorId: user2.id,
                name: `recipe ${num}`,
                instructions: `Sample instructions for recipe ${num}`
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