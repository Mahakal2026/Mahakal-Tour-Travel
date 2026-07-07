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

  // Seed Admin user if none exists in the database
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      logger.info("🌱 Seeding default Admin user...");
      await Admin.create({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD_HASH, // Stored directly as hashed value from env
      });
      logger.info(`✅ Default Admin user created: ${env.ADMIN_EMAIL}`);
    }
  } catch (error: any) {
    logger.error(`❌ Failed to seed default Admin: ${error.message}`);
  }

  // Start safety-net cron job (handled conditionally within the job for production only)
  startInquiryCleanupJob();

  // Start Express Server
  server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`🔗 Admin login: ${env.ADMIN_EMAIL}`);
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
