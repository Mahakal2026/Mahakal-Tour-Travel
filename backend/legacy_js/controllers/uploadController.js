const imagekit = require("../config/imagekit");

// @desc    Upload image to ImageKit
// @route   POST /api/upload
// @access  Admin
const uploadImage = async (req, res, next) => {
  try {
    if (!imagekit) {
      return res.status(503).json({
        success: false,
        message: "ImageKit is not configured. Please set credentials in .env",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await imagekit.upload({
      file: req.file.buffer.toString("base64"),
      fileName: `mtt_${Date.now()}_${req.file.originalname}`,
      folder: "/mahakal-tour-travels",
    });

    res.json({
      success: true,
      data: {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        thumbnailUrl: result.thumbnailUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };
