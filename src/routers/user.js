import { Router } from "express";
import { createUser, login, refreshToken, updateUser, deleteUser } from "../controller/user.js";
import { authenticateUser , checkRoles} from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = Router();

// create new user 
router.post('/signup', upload.single('userImage'), createUser);

// login
router.post('/login', login);

// update user
router.patch('/', authenticateUser, checkRoles("user"), upload.single('userImage'), updateUser);

// delete user
router.delete('/', authenticateUser, checkRoles("user"), deleteUser); 

// refresh token
router.post('/refresh-token', refreshToken); 

export default router; 
