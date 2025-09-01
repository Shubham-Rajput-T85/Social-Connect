import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    hashPassword: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: false
    }
}, {timestamps: true});

    // const user = new User({
    //     name: "Simon Riley",
    //     username: "ghost",
    //     email: "simon.riley@example.com",
    //     hashPassword: "12345678",
    //     bio: "never give up"
    // });
    // const response = await user.save();
    // console.log(response);

export default mongoose.model("User", userSchema);