import cloudinary from "./config/cloudinary.js";

async function testUpload() {
  try {
    const res = await cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", {
      folder: 'posts'
    });
    console.log("Success:", res.secure_url);
  } catch (error) {
    console.error("Cloudinary error:", error);
  }
}

testUpload();
