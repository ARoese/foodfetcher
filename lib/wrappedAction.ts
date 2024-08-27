"use client";
import type {ServerActionResponse} from "./actions"
export default async function wrappedAction<T>(actionPromise : Promise<ServerActionResponse<T>>) : Promise<T> {
    const res = await actionPromise;
    if(res == undefined){
        return undefined;
    }
    //console.log(res);
    if(res.result !== undefined){ 
        return res.result; // if it is a good result, return it
    }else{
        throw new Error(res.error); // re-throw the contained error on client-side
    }
}