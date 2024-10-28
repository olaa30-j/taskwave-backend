import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userImage: {
        type: String,  
        default:"",
        required: true
    },
    username:{
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        default: null  
    },
    role:{
        type: String,
        default: "user"
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
