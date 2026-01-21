import {v2 as cloudinary} from 'cloudinary';

import dotenv from 'dotenv';
import path from 'path';

const __dirname = path.resolve()

dotenv.config({ path: path.join(__dirname, '..', '.env') })
dotenv.config({ path: path.join(__dirname, '.env') })

const cleanEnv = (val) => {
    if (!val) return val;
    let cleaned = val.trim();
    // Remove surrounding quotes if present
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    return cleaned;
};

const cloud_name = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);
const api_key = cleanEnv(process.env.CLOUDINARY_API_KEY);
const api_secret = cleanEnv(process.env.CLOUDINARY_API_SECRET);

console.log("Cloudinary Config Check:");
console.log("Cloud Name:", cloud_name || "MISSING");
console.log("API Key:", api_key ? `Present (length: ${api_key.length})` : "MISSING");
console.log("API Secret:", api_secret ? `Present (length: ${api_secret.length})` : "MISSING");

cloudinary.config({
    cloud_name,
    api_key,
    api_secret
});

export default cloudinary;
