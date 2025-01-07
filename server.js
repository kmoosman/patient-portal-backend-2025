import app from "./app.js";
import cloudinary from "cloudinary";

const port = process.env.PORT || 5194;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
