"use server";
import { createHash } from "crypto";
import fs, { ReadStream } from "fs";
import {fileTypeFromFile} from "file-type";
import {default as pathLib} from "path";
import { Readable } from "stream";
import { intoError, intoResult, ServerActionResponse } from "./actions";
import mediaConstants from "./mediaConstants";

// where video files are stored
const videosPath = "data/media/videos/";
// where image files are stored
const imagesPath = "data/media/images/";
// where any file being validated is stored.
// these files may or may not be the types they claim to be!
const validatingPath = "data/media/validating/";
// files are named based on a hash of their name and the current time.
// this determines how long the hash is. Lower values can risk file name
// collisions!
const hashLength = 16;


function hashName(name : string) : string {
    const nowMs = Date.now();
    const hash = createHash("sha1")
        .update(nowMs.toString())
        .update(name.toString())
        .digest('base64url')
        .slice(0, hashLength); // max 16 characters
    const parts = name.split('.');
    return hash + "." + parts[parts.length-1];
}

function fullPath(name : string, type : "video" | "image") : string {
    const root = type == "video" ? videosPath : imagesPath;
    return pathLib.join(root, name);
}

function validationPath(name : string) : string {
    const root = validatingPath;
    return pathLib.join(validatingPath, name);
}

export async function mediaExists(name : string, type : "video" | "image") : Promise<boolean> {
    const checkPath = fullPath(name, type);
    return fs.existsSync(checkPath)
}

export async function getMedia(name : string, type : "video" | "image" ) : Promise<ReadStream | null> {
    const checkPath = fullPath(name, type);


    return fs.existsSync(checkPath) ? fs.createReadStream(checkPath) : null;
}

function readableStreamToReadStream(readableStream) {
    const reader = readableStream.getReader();
    
    return new Readable({
        async read() {
            try {
                const { done, value } = await reader.read();
                if (done) {
                    this.push(null); // End of stream
                } else {
                    this.push(Buffer.from(value));
                }
            } catch (error) {
                this.destroy(error); // Handle errors
            }
        }
    });
}

function ensurePaths(){
    const options = {recursive: true};
    fs.mkdirSync(videosPath, options);
    fs.mkdirSync(imagesPath, options);
    fs.mkdirSync(validatingPath, options);
}

function fromMime<T extends string | undefined | null>(mimeType: T) : T {
    if(!mimeType){
        return mimeType;
    }

    // MIME types are basically paths
    return pathLib.basename(mimeType) as T;
}

async function validateFileType(path : string, expectedMime : string) : Promise<string | null> {
    // check file type
    const fileTypeMime = (await fileTypeFromFile(path))?.mime;
    
    // and convert that from a mime type to a simple "jpeg" or "png"
    const expectedType = fromMime(expectedMime);
    const fileType = fromMime(fileTypeMime);
    
    // indeterminate or not matching claimed type are validation failures
    if(fileTypeMime === undefined){
        return "Could not determine type of uploaded file. It is probably corrupted.";
    }
    if(expectedType != fileType){
        return `Actual file type (${fileTypeMime}) does not match blob mime type (${expectedMime}). This file isn't what it claims to be!`;
    }
    return null;
}

async function StreamToFile(path : string, file : File){
    const outStream = fs.createWriteStream(path);
    const writeOp = readableStreamToReadStream(file.stream()).pipe(outStream);
    /*  we are about to open this file immediately after, so we need
        to make sure the pipes close and flush BEFORE that happens.
        we need to use a weird polling wait for the event to make sure
        the finish event triggers before our code continues
        TODO: do something that isn't hacky here
    */
    var isFinished = false;
    outStream.addListener("finish", () => {isFinished = true});
    while(!isFinished){
        if(isFinished){break;}
        // arbitrary timeout for polling.
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // try to ensure flushes
    writeOp.end();
    outStream.end();
} 

export async function setMedia(name : string, type : "video" | "image", form : FormData | null) : Promise<ServerActionResponse<string>>{
    ensurePaths();
    if(form == null){
        const fp = fullPath(name, type);
        fs.unlinkSync(fp);
    }else{
        // validate file size
        const correctConstants = type == "video" ? mediaConstants.video : mediaConstants.image;
        const file = form.get(type) as File;
        if(file.size / 1e6 > correctConstants.maxSizeMB){
            return intoError(`File is too large. Max allowed size is ${file.size}MB.`);
        }

        // save to validation directory
        const hashedName = hashName(name);
        const vp = validationPath(hashedName);
        await StreamToFile(vp, file);

        // validate file type
        const fp = fullPath(hashedName, type);
        try{
            const err = await validateFileType(vp, file.type);
            if(err){
                return intoError(err);
            }
            if(!correctConstants.allowedTypes.includes(fromMime(file.type))){
                return intoError(`'${file.type}' is not a supported ${type} type.`);
            }

            // file type is valid, so move it to its final destination
            fs.renameSync(vp, fp);
            return intoResult(hashedName);
        }catch(e){
            fs.unlinkSync(vp);
        }
    }
}