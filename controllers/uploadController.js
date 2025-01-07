import cloudinary from "cloudinary";

export const uploadImage = async (req, res) => {

  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    const buffer = req.file.buffer;

    const response = await cloudinary.uploader.upload(
      "data:image/png;base64," + buffer.toString("base64"),
      {
        resource_type: "image",
      }
    );
    res.json({ url: response.url });
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to upload");
  }
};
