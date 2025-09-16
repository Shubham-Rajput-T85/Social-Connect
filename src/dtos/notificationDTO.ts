export type NotificationType = "like" | "comment" | "followRequest" | "acceptedRequest";

export interface notificationDTO {
    type: NotificationType,
    userId: string,
    postId?: string,
    senderUserId: string,  
}