export enum FollowState {
    FOLLOW = "Follow",
    REQUESTED = "Requested",
    FOLLOWING = "Following",
    FOLLOW_BACK = "Follow Back"
}

export interface IMedia {
    url?: string;
    type?: "image" | "video";
}