import { FileUploader } from "react-drag-drop-files";
import UploadCover from "./UploadCover";
import { setMedia } from "@/lib/media";
import recipeImageJsx from "@/lib/recipeUtil";

type setFunction = (media : string) => void

type args = {
    beingEdited : boolean,
    imageFile : string|null,
    videoFile : string|null,
    setImageFile : setFunction,
    setVideoFile : setFunction
}
function FileUploads({beingEdited, imageFile, videoFile, setImageFile, setVideoFile} : args) {
    // TODO: verify file types
    async function handleImageUpload(file : File){
        console.log(file);
        const d = new FormData();
        d.append("image", file);
        const remoteName = await setMedia(file.name, "image", d);
        setImageFile(remoteName);
    }

    async function handleVideoUpload(file : File){
        console.log(file);
        const d = new FormData();
        d.append("video", file);
        const remoteName = await setMedia(file.name, "video", d);
        setVideoFile(remoteName);
    }
    
    return ( 
        beingEdited
        ? (
            <>
            <FileUploader 
                label="Drop an image here"
                handleChange={handleImageUpload}
            >
                <div className="relative">
                    {recipeImageJsx(imageFile)}
                    <UploadCover 
                        text={"Upload recipe image"}
                        className="absolute inset-0 bg-white bg-opacity-60"
                    />
                </div>
            </FileUploader>
            <FileUploader
                label="Drop a video here"
                handleChange={handleVideoUpload}
            >
                <div className="relative">
                    { // Same thing but without controls. This allows a click without play
                        videoFile 
                        ? <video width="100%" className="max-w-fit" src={`/media/video/${videoFile}`}>
                            Your browser does not support the video tag
                        </video>
                        : <div className="min-w-fit min-h-60 bg-gray-400">
                            <p className="my-auto">Drop a video file here</p>
                        </div>
                    }
                    <UploadCover 
                        text={"Upload recipe video"}
                        className="absolute inset-0 bg-white bg-opacity-60"
                    />
                </div>
            </FileUploader>
            </>
        ) : (
            <>
            {recipeImageJsx(imageFile)}
            {
                videoFile &&
                <video controls width="100%" className="max-w-fit" src={`/media/video/${videoFile}`}>
                    Your browser does not support the video tag
                </video>
            }
            </>
            
        )
    );
}

export default FileUploads;