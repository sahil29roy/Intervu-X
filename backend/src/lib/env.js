import dotenv from "dotenv"

dotenv.config({quiet : true});


export const ENV = {
    PORT : process.env.PORT,
    DB_URL : process.env.DB_URL,
    NODE_ENV :  process.env.NODE_ENV, 
    STREAM_API_KEY : process.env.STREAM_API_KEY,
    STREAM_API_SECRET : process.env.STREAM_API_SECRET,
    CLIENT_URL : process.env.CLIENT_URL,
    JWT_SECRET : process.env.JWT_SECRET,
    CLOUDINARY_CLOUD_NAME : process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET : process.env.CLOUDINARY_API_SECRET,
    REDIS_HOST : process.env.REDIS_HOST,
    REDIS_PORT : parseInt(process.env.REDIS_PORT || "6379"),
    REDIS_USERNAME : process.env.REDIS_USERNAME || "default",
    REDIS_PASSWORD : process.env.REDIS_PASSWORD,
}

