import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import imagekit from "../config/imagekit";

// Configure memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Only image/jpeg, image/png, and image/webp mime types are allowed",
          400,
          "UPLOAD_ERROR"
        )
      );
    }
  },
});

/**
 * Reusable middleware for uploading a single file to ImageKit
 * @param fieldName The name of the field containing the file in multipart form
 * @param folder The folder path inside ImageKit where the image should be stored
 */
export const uploadToImageKit = (fieldName: string, folder: string) => {
  const uploadSingle = upload.single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    const reqAny = req as any;
    uploadSingle(req, res, async (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(
              new AppError(
                "File size limit exceeded. Max limit is 5MB.",
                400,
                "UPLOAD_ERROR"
              )
            );
          }
          return next(new AppError(err.message, 400, "UPLOAD_ERROR"));
        }
        return next(err);
      }

      // If no file was uploaded, proceed (useful for updates where new image is optional)
      if (!reqAny.file) {
        return next();
      }

      try {
        const fileBase64 = reqAny.file.buffer.toString("base64");
        const fileName = `mtt_${Date.now()}_${reqAny.file.originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`;

        const uploadResponse = await imagekit.upload({
          file: fileBase64,
          fileName,
          folder,
        });

        // Set the uploaded URL to req.file.path to mimic the expected behaviour
        reqAny.file.path = uploadResponse.url;
        next();
      } catch (uploadErr: any) {
        return next(
          new AppError(
            uploadErr.message || "Failed to upload image to ImageKit",
            500,
            "UPLOAD_FAILED"
          )
        );
      }
    });
  };
};
