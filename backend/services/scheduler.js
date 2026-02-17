import cron from 'node-cron';
import Borrower from '../models/Borrower.js';

// Run every day at midnight (00:00:00)
// Cron syntax: Second Minute Hour Day Month DayOfWeek
const JOB_SCHEDULE = '0 0 0 * * *';

export const initScheduler = () => {
    console.log(`[Scheduler] Initialized. Job set to run at: ${JOB_SCHEDULE} (Midnight Daily)`);

    cron.schedule(JOB_SCHEDULE, async () => {
        console.log('[Scheduler] Starting daily overdue update job...');
        try {
            const today = new Date();
            // Reset time to midnight for accurate day calculation
            today.setHours(0, 0, 0, 0);

            // Find all borrowers - optimization: could filter by Active loans only if status field existed reliably
            const borrowers = await Borrower.find({});

            let updatedCount = 0;

            for (const borrower of borrowers) {
                if (!borrower.dueDate) continue;

                const dueDate = new Date(borrower.dueDate);
                dueDate.setHours(0, 0, 0, 0);

                // Calculate difference in time
                const diffTime = today - dueDate;

                // Calculate difference in days (divide by milliseconds per day)
                // Use Math.ceil to treat any part of a day as a full day late if past due
                // or Math.floor for full completed days. Standard is usually floor or round.
                // Let's use Math.floor to be consistent with "Overdue by X days".
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                let updates = {};

                // Logic: If today > dueDate, they are overdue.
                // diffDays will be positive if overdue, negative if not yet due.

                const newOverdueDays = diffDays > 0 ? diffDays : 0;
                const newIsOverdue = diffDays > 0;

                // Update only if changed
                if (borrower.overdueDays !== newOverdueDays || borrower.isOverdue !== newIsOverdue) {
                    updates.overdueDays = newOverdueDays;
                    updates.isOverdue = newIsOverdue;

                    await Borrower.updateOne({ _id: borrower._id }, { $set: updates });
                    updatedCount++;
                }
            }

            console.log(`[Scheduler] Job complete. Updated ${updatedCount} borrowers.`);

        } catch (error) {
            console.error('[Scheduler] Error in daily update job:', error);
        }
    });
};

/* 
   Manual trigger function for testing or admin override 
   Can be called via an API endpoint if needed later.
*/
export const runDailyUpdateNow = async () => {
    console.log('[Scheduler] Manual trigger: Running daily update now...');
    // Re-use logic or just copy-paste for safety to avoid export circulars if checking types? 
    // For simplicity, let's keep logic isolated inside the cron for now 
    // but exposing the logic function is best practice.

    // ... (Same logic as above, cleaner to extract into a helper function)
    await performDailyUpdate();
};

const performDailyUpdate = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const borrowers = await Borrower.find({});
        let updatedCount = 0;

        for (const borrower of borrowers) {
            if (!borrower.dueDate) continue;
            const dueDate = new Date(borrower.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const diffTime = today - dueDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            const newOverdueDays = diffDays > 0 ? diffDays : 0;
            const newIsOverdue = diffDays > 0;

            if (borrower.overdueDays !== newOverdueDays || borrower.isOverdue !== newIsOverdue) {
                await Borrower.updateOne({ _id: borrower._id }, {
                    $set: { overdueDays: newOverdueDays, isOverdue: newIsOverdue }
                });
                updatedCount++;
            }
        }
        console.log(`[Scheduler] Manual Job complete. Updated ${updatedCount} borrowers.`);
        return updatedCount;
    } catch (error) {
        console.error('[Scheduler] Error in manual update:', error);
        throw error;
    }
};
