const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

// Multer config — store in memory buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"), false);
    }
  },
});

// Admin: Upload image
router.post("/", auth, upload.single("image"), uploadImage);

module.exports = router;
