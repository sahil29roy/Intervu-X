import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "./public/uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (file.fieldname === "profilePicture") {
        const allowedImageTypes = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
        if (allowedImageTypes.includes(fileExtension) && file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images (.png, .jpg, .jpeg, .webp, .gif) are allowed for profile pictures!"), false);
        }
    } else if (file.fieldname === "resume") {
        const allowedDocTypes = [".pdf", ".doc", ".docx"];
        if (allowedDocTypes.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error("Only documents (.pdf, .doc, .docx) are allowed for resumes!"), false);
        }
    } else {
        cb(null, true);
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});
