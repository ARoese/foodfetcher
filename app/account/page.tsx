import { PrismaClient } from "@prisma/client";
import SmallPageContainer from "../components/SmallPageContainer";
import { auth } from "@/auth";
import { signIn } from "next-auth/react";
import AccountView from "./AccountView";

const prisma = new PrismaClient();

async function Account() {
    // if not logged in, send them to do so
    const session = await auth();
    if(!session){
        signIn();
    }

    // get user who is logged in
    const currentUser = await prisma.user.findUnique({
        where: {
            id: Number(session.user.id)
        },
        omit: {
            passhash: true
        }
    });

    return ( 
        <SmallPageContainer>
            <AccountView account={currentUser}/>
        </SmallPageContainer>
     );
}

export default Account;