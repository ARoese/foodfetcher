"use client";
import recipeImage from "@/public/images/logo.png";
import Image from "next/image";

/** turns a nullable image name into the img or Image element that should display it */
export default function recipeImageJsx(imageFile : string|null){
    return imageFile
        // eslint-disable-next-line @next/next/no-img-element
        ? <img width="100%" height="100%" src={`/media/image/${imageFile}`} alt="Recipe cover image"/>
        : <Image width="0" height="0" src={recipeImage} alt="Recipe cover image"/>
}