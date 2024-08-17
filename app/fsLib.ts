"use server";
import { createHash } from "crypto";
import fs, { ReadStream } from "fs";
import path from "path";
import { Readable } from "stream";

const videosPath = "media/videos/";
const imagesPath = "media/images/";

function hashName(name : string) : string {
    const nowMs = Date.now();
    const hash = createHash("sha1")
        .update(nowMs.toString())
        .update(name.toString())
        .digest('base64')
        .slice(0, 15); // max 15 characters
    const parts = name.split('.');
    return hash + "." + parts[parts.length-1];
}

function fullPath(name : string, type : "video" | "image") : string {
    const root = type == "video" ? videosPath : imagesPath;
    return path.join(root, name);
}

export async function mediaExists(name : string, type : "video" | "image") : Promise<boolean> {
    const checkPath = fullPath(name, type);
    return fs.existsSync(checkPath)
}

export async function getMedia(name : string, type : "video" | "image" ) : Promise<ReadStream | null> {
    const checkPath = fullPath(name, type);
    console.log(__dirname);
    console.log(checkPath);
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

export async function setMedia(name : string, type : "video" | "image", form : FormData | null) : Promise<string>{
    if(form == null){
        const fp = fullPath(name, type);
        fs.unlinkSync(fp);
    }else{
        const hashedName = hashName(name);
        const fp = fullPath(hashedName, type);
        const file = form.get("image") as File;
        //fs.writeFileSync(fp, file.arrayBuffer())
        const outStream = fs.createWriteStream(fp);
        readableStreamToReadStream(file.stream()).pipe(outStream);
        return hashedName;
    }
}