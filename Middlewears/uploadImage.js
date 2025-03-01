const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Configure Multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

console.log("ENV TEST - R2_ACCESS_KEY_ID:", process.env.R2_ACCESS_KEY_ID);
console.log("ENV TEST - R2_SECRET_ACCESS_KEY:", process.env.R2_SECRET_ACCESS_KEY);


// Configure the S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: "https://3a1668b00e517475c8814a6bdf4f30b0.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID, 
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});


// Middleware to handle file upload and upload to R2
module.exports.upload = upload.single("image");

module.exports.uploadToR2 = async (req, res, next) => {
  try { 
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const fileName = Date.now() + "--" + req.body.company;

    // Upload the file to R2
    const uploadParams = {
      Bucket: "reviewonthego-client", // Replace with your R2 bucket name
      Key: fileName, // File name in R2
      Body: file.buffer, // File data
      ContentType: file.mimetype, // File type (e.g., image/jpeg)
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

   // Attach the file URL to the request object
   req.fileUrl = fileName;

   // Call the next middleware or route handler
   next();
  } catch (error) {
    console.error("Error uploading to R2:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};