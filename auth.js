import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
// Your own logic for dealing with plaintext password strings; be careful!
//import { saltAndHashPassword } from "@/utils/password"

async function credentialsAuthorize(credentials) {
	let user = null
	
	// TODO: link up with database
	// logic to salt and hash password
	//const pwHash = saltAndHashPassword(credentials.password)

	// logic to verify if the user exists
	//user = await getUserFromDb(credentials.email, pwHash)
	//user = credentials.email

	//if (!user) {
	//  // No user found, so this is their first attempt to login
	//  // meaning this is also the place you could do registration
	//  throw new Error("User not found.")
	//}

	// return user object with their profile data
	//console.log(credentials);
	return {
		name: "PlaceHolderUser",
		email: credentials.email
	}
}

const providers = [
	Credentials({
		// You can specify which fields should be submitted, by adding keys to the `credentials` object.
		// e.g. domain, username, password, 2FA token, etc.
		credentials: {
			email: {},
			password: {type: "password"},
		},
		authorize: credentialsAuthorize
	})
];

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers
});