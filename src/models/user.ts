import mongoose from "mongoose";
import IUser from "../interfaces/IUser";

const Schema = mongoose.Schema;

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    hashPassword: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: false
    },
    postCount: {
        type: Number,
        required: false,
        default: 0
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    followersCount: {
        type: Number,
        required: false,
        default: 0
    },
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    followingCount: {
        type: Number,
        default: 0,
        required: false
    },
    followRequest: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    followRequestCount: {
        type: Number,
        default: 0,
        required: false
    }
}, {timestamps: true});

const User = mongoose.model<IUser>("User", userSchema);
export default User;