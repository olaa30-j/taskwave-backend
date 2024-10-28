import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the configuration
cloudinary.api.ping().then(() => {
    console.log('Cloudinary is configured correctly');
  }).catch(err => {
    console.error('Error configuring Cloudinary:', err);
  }); 

// Create store from Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', 
        allowed_formats: ['jpeg', 'jpg', 'png', 'gif'], 
        transformation: [{ width: 500, height: 500, crop: 'auto' }], 
    },
});

// Configure multer to upload images
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
        }
    }
});

export default upload;
