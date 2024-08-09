import { PrismaClient } from "@prisma/client"
import { randomBytes, scryptSync } from "crypto";
import NextAuth, { CredentialsSignin, DefaultSession, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
// Your own logic for dealing with plaintext password strings; be careful!
//import { saltAndHashPassword } from "@/utils/password"

const BUFFER_ENCODING = 'base64'

export function doPasswordHash(password : string, salt : string) : string{
    return scryptSync(password, salt, 64).toString(BUFFER_ENCODING);
}

export function createPassword(password : string) : string {
    const salt = randomBytes(32).toString(BUFFER_ENCODING);
    const hash = doPasswordHash(password, salt);
	// TODO: make these different fields in the DB
    return `${hash}$${salt}`;
}

export function verifyPassword(password : string, stringFromDB : string) : boolean {
	if(stringFromDB === null){
		return true;
	}
	// TODO: make these different fields in the DB
    const [hash, salt] = stringFromDB.split('$');
    const hashed = doPasswordHash(password, salt);
    return hashed == hash;
}

export async function verifyPasswordAgainstDB(password : string, userId : number) : Promise<boolean>{
    const userFromDB = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    return verifyPassword(password, userFromDB.passhash);
}

const prisma = new PrismaClient();
async function credentialsAuthorize(credentials) : Promise<User> {
	const user = await prisma.user.findUnique({
			where: {
				name: credentials.username
			}
		}
	);

	if (user === null){
		throw new CredentialsSignin("User not found");
	}

	// null password means to let anyone log in
	// TODO:? do one-time password stuff here, maybe
	if(user.passhash !== null && !verifyPassword(credentials.password, user.passhash)){
		throw new CredentialsSignin("Incorrect Password");
	}

	return {
		id: String(user.id),
		name: user.name
	};
}

const providers = [
	Credentials({
		// You can specify which fields should be submitted, by adding keys to the `credentials` object.
		// e.g. domain, username, password, 2FA token, etc.
		credentials: {
			username: {},
			password: {type: "password"},
		},
		authorize: credentialsAuthorize
	})
];

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers,
	callbacks: {
		async jwt({user, token}) {
			if(user){
				token.sub = user.id;
			}
			return token;
		},

		async session({session, token}) {
			if(token?.sub){
				session.user.id = token.sub;
			}
			return session;
		},
	}
});