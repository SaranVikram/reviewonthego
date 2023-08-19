const path = require("path")
const multer = require("multer")

// Storage Engin That Tells/Configures Multer for where (destination) and how (filename) to save/upload our files
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/client-logos") //important this is a direct path from our current file to storage location
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname)
  },
})

// The Multer Middleware that is passed to routes that will receive income requests with file data (multipart/formdata)
// You can create multiple middleware each with a different storage engine config so save different files in different locations on server
const upload = multer({ storage: fileStorageEngine })

;(module.exports.upload = upload.single("image")),
  (request, response, next) => {
    next()
  }
