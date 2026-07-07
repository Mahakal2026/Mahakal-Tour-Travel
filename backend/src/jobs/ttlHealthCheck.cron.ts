import cron from "node-cron";
import BookingInquiry from "../modules/booking/booking.model";
import { logger } from "../config/logger";
import { env } from "../config/env";

export const startInquiryCleanupJob = (): void => {
  // Only schedule/run the safety-net cron in production environment to speed up development boot
  if (env.NODE_ENV !== "production") {
    logger.info("⚠️ Safety net cron job bypassed (runs in production mode only)");
    return;
  }

  cron.schedule("0 0 * * *", async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const count = await BookingInquiry.countDocuments({
        createdAt: { $lt: sevenDaysAgo },
      });

      if (count > 0) {
        logger.warn(
          `🧹 [Safety Net Cron] Found ${count} BookingInquiry documents older than 7 days that MongoDB's TTL thread hasn't cleaned up yet.`
        );
      } else {
        logger.info(
          `🧹 [Safety Net Cron] Daily check complete. No BookingInquiry documents older than 7 days found. TTL index is running properly.`
        );
      }
    } catch (error: any) {
      logger.error(`❌ [Safety Net Cron] Error during safety-net audit check: ${error.message}`);
    }
  });

  logger.info("⏰ Inquiry safety net cleanup cron job scheduled (daily at midnight)");
};

export default startInquiryCleanupJob;
