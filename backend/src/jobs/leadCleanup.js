const cron = require("node-cron");
const Lead = require("../models/Lead");
const { sendLeadReport } = require("../utils/mailer");

/**
 * Lead Cleanup & Report Cron Job
 * Runs every Sunday at midnight (00:00)
 * 
 * Actions:
 * 1. Generate lead summary report
 * 2. Send report to owner email
 * 3. Delete leads older than 7 days
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

      const totalLeads = leads.length;

      // Group leads by source
      const leadsBySource = leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {});

      // Send report email
      if (totalLeads > 0) {
        await sendLeadReport({
          totalLeads,
          leadsBySource,
          leads,
        });
        console.log(`📧 Lead report sent — ${totalLeads} leads`);
      } else {
        console.log("📭 No leads this week — skipping report");
      }

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
