import { addPostDTO } from "../dtos/post/addPostDTO";
import Post from "../models/post";
import { AppError } from "../utils/errorUtils";
import { getMediaTypeFromUrl } from "../utils/mediaUtils";

export const addPost = async (postData: addPostDTO) => {
    const { userId, postContent, mediaUrl } = postData;

    // Determine media type if media URL is provided
    let mediaObject = undefined;
    if (mediaUrl) {
        const mediaType = getMediaTypeFromUrl(mediaUrl);

        if (!mediaType) {
            throw new AppError("Invalid media type", 400, [
                { field: "media", message: "Unsupported file format for media" },
            ]);
        }

        mediaObject = { url: mediaUrl, type: mediaType };
    }
    const newPost = new Post({
        userId,
        postContent,
        media: mediaObject,
    });
    const response = await newPost.save();
    console.log("response: ", response);

    return response;
}