import { PrismaClient } from "@prisma/client"
import NextAuth, { DefaultSession, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
// Your own logic for dealing with plaintext password strings; be careful!
//import { saltAndHashPassword } from "@/utils/password"

const prisma = new PrismaClient();
const crypto = require("crypto");
async function credentialsAuthorize(credentials) : Promise<User> {
	const user = await prisma.user.findUnique({
			where: {
				name: credentials.username
			}
		}
	);

	if (user === null){
		throw new Error("User not found");
	}

	// TODO: password checking
	if(user.passhash !== null){
		throw new Error("Incorrect Password");
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