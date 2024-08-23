import { NextRequest, NextResponse } from "next/server";
import defaultLogo from "@/public/images/logo.png";
import { getMedia } from "@/lib/media";
import { ReadStream } from "fs";
import { ReadableOptions } from "stream";

// https://github.com/vercel/next.js/discussions/15453#discussioncomment-6748645
function streamFile(file: ReadStream, options?: ReadableOptions): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            file.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
            file.on("end", () => controller.close());
            file.on("error", (error: NodeJS.ErrnoException) => controller.error(error));
        },
        cancel() {
            file.destroy();
        },
    });
}

const response404 = new Response("Not Found", {status: 404});

export async function GET(request : Request, { params } : {params: {type : "video" | "image", name : string}}){
    console.log(params);
    const {type, name} = params;
    const defaultLogoPath = new URL("/images/logo.png", request.url);
    
    if(["video", "image"].indexOf(type) == -1 || name.includes("..")){
        return response404;
    }
    
    const fileStream = await getMedia(name, type);
    //console.log(fileStream);
    if(fileStream == null){
        return type == "image" 
            ? NextResponse.redirect(defaultLogoPath) 
            : response404;
    }

    return new NextResponse(streamFile(fileStream), {status: 200, statusText: "OK"});
}