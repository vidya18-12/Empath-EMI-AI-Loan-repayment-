import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from './models/Borrower.js';
import connectDB from './config/db.js';

dotenv.config();

const verifyConsistency = async () => {
    try {
        await connectDB();

        console.log('\n🔍 Verifying Risk Level Consistency...');
        console.log('═══════════════════════════════════════════════════════════════════\n');

        const borrowers = await Borrower.find({});

        let consistent = 0;
        let inconsistent = 0;

        for (const borrower of borrowers) {
            const stressLevel = borrower.behavioralAnalysis?.stressLevel;
            const riskLevel = borrower.riskLevel;

            // Map stress to expected risk
            const expectedRisk = {
                'Low': 'NORMAL_RISK',
                'Moderate': 'MODERATE_RISK',
                'High': 'HIGH_RISK',
                'Critical': 'CRITICAL_RISK',
                'Unknown': 'PENDING'
            }[stressLevel] || 'PENDING';

            if (riskLevel === expectedRisk) {
                console.log(`✅ ${borrower.customerName}: ${stressLevel} → ${riskLevel}`);
                consistent++;
            } else {
                console.log(`❌ MISMATCH: ${borrower.customerName}`);
                console.log(`   Stress Level: ${stressLevel}`);
                console.log(`   Risk Level: ${riskLevel} (expected ${expectedRisk})`);
                inconsistent++;
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log(`\n📊 Results:`);
        console.log(`   Total: ${borrowers.length}`);
        console.log(`   ✅ Consistent: ${consistent}`);
        console.log(`   ❌ Inconsistent: ${inconsistent}`);

        if (inconsistent > 0) {
            console.log('\n⚠️  WARNING: Some borrowers still have inconsistent data!');
        } else {
            console.log('\n✅ All borrowers have consistent risk levels!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

verifyConsistency();
