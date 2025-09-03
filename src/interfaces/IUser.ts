import {Types, Document} from "mongoose";

export default interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    username: string;
    email: string; // Reference to User
    hashPassword: string;
    profileUrl?: string;
    bio: string;
    postCount: number;

    followers: Types.ObjectId[];       // references to other Users
    followersCount?: number;
  
    following: Types.ObjectId[];       // references to other Users
    followingCount?: number;
  
    followRequest: Types.ObjectId[];   // references to other Users
    followRequestCount: number;
  
    createdAt?: Date;
    updatedAt?: Date;
    
}