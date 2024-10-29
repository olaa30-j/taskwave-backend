import UserModel from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ///////////////////////////////////////////////////////////////////////////////////////// //
// POST create user
export const createUser = async (req, res) => {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
        return res.status(400).send({ message: "All fields are required." });
    }

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).send({ message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let image;
        if (req.file) {
            image = req.file.path.replace(/\\/g, '/'); 
        }

        const newUser = new UserModel({
            email,
            password: hashedPassword,
            username,
            userImage: image
        });

        await newUser.save();

        return res.status(201).json({ message: "User created successfully." });
    } catch (error) {
        console.error("Error creating user:", error.message);
        return res.status(500).send({ message: "Server error." });
    }
};


// ///////////////////////////////////////////////////////////////////////////////////////// //
// POST login
const TOKEN_EXPIRATION = "1h";
const REFRESH_TOKEN_EXPIRATION = "7d";
const COOKIE_MAX_AGE = 3600000;

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(401).send({ message: "Error: Missing email or password." });
    }

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        const verifiedPassword = await bcrypt.compare(password, user.password);
        if (!verifiedPassword) {
            return res.status(401).send({ message: "Invalid credentials." });
        }

        const payload = {
            userId: user._id,
            username: user.username,
            email: user.email,
            userImage: user.userImage,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
        const refreshToken = jwt.sign(payload, process.env.Refresh_Token_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION });
    
        res.cookie('authToken', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: COOKIE_MAX_AGE,
            path: '/', 
            sameSite: 'strict'
        });

        await UserModel.findByIdAndUpdate(user._id, { refreshToken });
        return res.status(200).json({ message: "Login successful." });
    } catch (err) {
        console.error("Error logging in:", err.message);
        return res.status(500).send({ message: "Server error." });
    }
}


// ///////////////////////////////////////////////////////////////////////////////////////// //
// Patch update user
export const updateUser = async (req, res) => {
    const userId = req.user.userId; 
    const updates = req.body;

    try {
        if (req.file) {
            updates.userImage = req.file.path.replace(/\\/g, '/'); 
        }

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).send({ message: "User not found." });
        }

        return res.status(200).json({ message: "User updated successfully.", user: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error.message);
        return res.status(500).send({ message: "Server error." });
    }
};

// ///////////////////////////////////////////////////////////////////////////////////////// //
// DELETE user
export const deleteUser = async (req, res) => {    
    const userId = req.user.userId; 

    try {
        const deletedUser = await UserModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).send({ message: "User not found." });
        }

        return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        return res.status(500).send({ message: "Server error." });
    }
};


// ///////////////////////////////////////////////////////////////////////////////////////// //
// POST refreshToken
export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).send({ message: "Refresh token is required." });
    }

    try {
        const user = await UserModel.findOne({ refreshToken });
        if (!user) {
            return res.status(403).send({ message: "Invalid refresh token." });
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.Refresh_Token_SECRET_KEY);
            const newToken = jwt.sign({ email: user.email, username: user.username }, process.env.SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });

            res.cookie('authToken', newToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                maxAge: COOKIE_MAX_AGE,
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
            });

            return res.status(200).json({ message: "Token created." });
        } catch (err) {
            return res.status(403).send({ message: "Token verification failed." });
        }
    } catch (error) {
        console.error("Error refreshing token:", error.message);
        return res.status(500).send({ message: "Server error." });
    }
};
