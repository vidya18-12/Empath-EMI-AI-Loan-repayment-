import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from './models/Borrower.js';
import connectDB from './config/db.js';

dotenv.config();

// Mapping function
const syncRiskLevelWithStress = (stressLevel) => {
    const mapping = {
        'Low': 'NORMAL_RISK',
        'Moderate': 'MODERATE_RISK',
        'High': 'HIGH_RISK',
        'Critical': 'CRITICAL_RISK',
        'Unknown': 'PENDING'
    };
    return mapping[stressLevel] || 'PENDING';
};

const fixExistingData = async () => {
    try {
        await connectDB();

        console.log('\n🔧 Fixing Risk Level Inconsistencies in Database...');
        console.log('═══════════════════════════════════════════════════════════════════\n');

        // Get all borrowers
        const borrowers = await Borrower.find({});

        let updatedCount = 0;
        let noChangeCount = 0;

        for (const borrower of borrowers) {
            const oldRiskLevel = borrower.riskLevel;
            const stressLevel = borrower.behavioralAnalysis?.stressLevel;

            if (stressLevel && stressLevel !== 'Unknown') {
                const newRiskLevel = syncRiskLevelWithStress(stressLevel);

                if (oldRiskLevel !== newRiskLevel) {
                    borrower.riskLevel = newRiskLevel;
                    await borrower.save();

                    console.log(`✅ ${borrower.customerName}:`);
                    console.log(`   Stress Level: ${stressLevel}`);
                    console.log(`   Old Risk: ${oldRiskLevel} → New Risk: ${newRiskLevel}`);
                    console.log('   ─────────────────────────────────────');
                    updatedCount++;
                } else {
                    console.log(`✓  ${borrower.customerName}: Already synced (${stressLevel} → ${newRiskLevel})`);
                    noChangeCount++;
                }
            } else {
                console.log(`⚠️  ${borrower.customerName}: No stress level data, keeping ${oldRiskLevel}`);
                noChangeCount++;
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log(`\n📊 Summary:`);
        console.log(`   Total Borrowers: ${borrowers.length}`);
        console.log(`   Updated: ${updatedCount}`);
        console.log(`   No Change: ${noChangeCount}`);
        console.log('\n✅ Database synchronization complete!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

fixExistingData();
