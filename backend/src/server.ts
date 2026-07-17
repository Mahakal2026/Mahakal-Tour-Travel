import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./config/logger";
import Admin from "./modules/admin/admin.model";
import startInquiryCleanupJob from "./jobs/ttlHealthCheck.cron";
import mongoose from "mongoose";

let server: any;

const bootstrap = async () => {
  // Connect to Database
  await connectDB();

  // Ensure default Admin user exists and matches credentials from env
  try {
    await Admin.deleteOne({ email: "admin@mahakaltravels.com" });
    await Admin.findOneAndUpdate(
      { email: env.ADMIN_EMAIL },
      { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD_HASH },
      { upsert: true, new: true }
    );
    logger.info(`✅ Default Admin user synced: ${env.ADMIN_EMAIL}`);
  } catch (error: any) {
    logger.error(`❌ Failed to sync default Admin: ${error.message}`);
  }

  // Start safety-net cron job (handled conditionally within the job for production only)
  startInquiryCleanupJob();

  // Start Express Server
  server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // Handle unhandled rejections outside Express
  process.on("unhandledRejection", (err: Error) => {
    logger.error(`❌ Unhandled Rejection: ${err.message}`);
    gracefulShutdown("UNHANDLED REJECTION");
  });

  process.on("uncaughtException", (err: Error) => {
    logger.error(`❌ Uncaught Exception: ${err.message}`);
    gracefulShutdown("UNCAUGHT EXCEPTION");
  });
};

const gracefulShutdown = (reason: string) => {
  logger.info(`🛑 Graceful shutdown initiated due to ${reason}...`);

  if (server) {
    server.close(async () => {
      logger.info("🔒 Express server closed.");
      try {
        await mongoose.connection.close(false);
        logger.info("🔒 MongoDB connection closed.");
        process.exit(0);
      } catch (err: any) {
        logger.error(`❌ Error during MongoDB disconnection: ${err.message}`);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

// Listen for process terminate signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

bootstrap();
