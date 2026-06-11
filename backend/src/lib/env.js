import dotenv from "dotenv"

dotenv.config({quiet : true});


export const ENV = {
    PORT : process.env.PORT,
    DB_URL : process.env.DB_URL,
    NODE_ENV :  process.env.NODE_ENV, 
    STREAM_API_KEY : process.env.STREAM_API_KEY,
    STREAM_API_SECRET : process.env.STREAM_API_SECRET,
    CLIENT_URL : process.env.CLIENT_URL,
}

