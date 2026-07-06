const cron = require("node-cron");
const Lead = require("../models/Lead");

/**
 * Lead Cleanup & Report Cron Job
 * Runs every Sunday at midnight (00:00)
 * 
 * Actions:
 * 1. Delete leads older than 7 days
 */
const startLeadCleanupJob = () => {
  // Run every Sunday at midnight: "0 0 * * 0"
  cron.schedule("0 0 * * 0", async () => {
    console.log("🔄 Running weekly lead cleanup job...");

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get all leads from the past 7 days for the report
      const leads = await Lead.find({
        createdAt: { $gte: sevenDaysAgo },
      }).sort({ createdAt: -1 });


      // Delete leads older than 7 days
      const deleteResult = await Lead.deleteMany({
        createdAt: { $lt: sevenDaysAgo },
      });

      console.log(`🗑️ Deleted ${deleteResult.deletedCount} old leads`);
      console.log("✅ Weekly lead cleanup completed");
    } catch (error) {
      console.error("❌ Lead cleanup job error:", error.message);
    }
  });

  console.log("⏰ Lead cleanup cron job scheduled (every Sunday at midnight)");
};

module.exports = startLeadCleanupJob;
