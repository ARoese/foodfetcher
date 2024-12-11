import { FileUploader } from "react-drag-drop-files";
import UploadCover from "./UploadCover";
import { setMedia } from "@/lib/media";
import mediaConstants from "@/lib/mediaConstants";
import recipeImageJsx from "@/lib/recipeUtil";
import {toast} from "react-toastify";
import wrappedAction from "@/lib/wrappedAction";

type setFunction = (media : string) => void

type args = {
    beingEdited : boolean,
    imageFile : string|null,
    videoFile : string|null,
    setImageFile : setFunction,
    setVideoFile : setFunction
}
function FileUploads({beingEdited, imageFile, videoFile, setImageFile, setVideoFile} : args) {
    async function handleImageUpload(file : File){
        const d = new FormData();
        d.append("image", file);
        const uploadPromise = wrappedAction(setMedia(file.name, "image", d));
        try{
            await toast.promise(uploadPromise, {
                    pending: "Uploading image",
                    success: "Uploaded image",
                    error: {
                        render: (e) => {
                            const error = e.data as Error;

                            return `Failed to upload image: ${error.message}`;
                        }
                    },
                }, 
                {
                    autoClose: 10000
                },
            ).then((remoteName) => {
                setImageFile(remoteName);
            });
        }catch(e){}
    }

    async function handleVideoUpload(file : File){
        const d = new FormData();
        d.append("video", file);
        const uploadPromise = wrappedAction(setMedia(file.name, "video", d));
        await toast.promise(uploadPromise, {
                pending: "Uploading video",
                success: "Uploaded video",
                error: {
                    render: (e) => {
                        const error = e.data as Error;

                        return `Failed to upload video: ${error.message}`;
                    }
                },
            }, 
            {
                autoClose: 10000
            },
        ).then((remoteName) => {
            setVideoFile(remoteName);
        });
    }

    async function onTypeError(err){
        toast.error(err);
    }

    async function onImageSizeError(err){
        toast.error(`Max allowed image size is ${mediaConstants.image.maxSizeMB}MB.`);
    }

    async function onVideoSizeError(err){
        toast.error(`Max allowed video size is ${mediaConstants.video.maxSizeMB}MB.`);
    }
    
    return ( 
        beingEdited
        ? (
            <>
            <FileUploader 
                label="Drop an image here"
                handleChange={handleImageUpload}
                types={mediaConstants.image.allowedTypes}
                onTypeError={onTypeError}
                onSizeError={onImageSizeError}
                maxSize={mediaConstants.image.maxSizeMB}
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
                types={mediaConstants.video.allowedTypes}
                onTypeError={onTypeError}
                onSizeError={onVideoSizeError}
                maxSize={mediaConstants.video.maxSizeMB}
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