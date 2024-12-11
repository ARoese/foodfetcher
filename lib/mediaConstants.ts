export type MediaConstants = {
    maxSizeMB: number,
    allowedTypes: string[]
};

export type AllMediaConstants = {
    video: MediaConstants,
    image: MediaConstants
};

const mediaConstants : AllMediaConstants = {
    video: {
        maxSizeMB: 400,
        allowedTypes: ["mp4", "mpeg"]
    },
    image: {
        maxSizeMB: 60,
        allowedTypes: ["png", "jpeg"]
    },
};

export default mediaConstants;