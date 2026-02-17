import { assignRegionalExecutive } from './autoAssignment.js';

// Helper function to map stressLevel to riskLevel AND handle auto-assignment for high risk
export const syncRiskLevelWithStress = async (stressLevel, borrower) => {
    const mapping = {
        'Low': 'NORMAL_RISK',
        'Moderate': 'MODERATE_RISK',
        'High': 'HIGH_RISK',
        'Critical': 'CRITICAL_RISK',
        'Unknown': 'PENDING'
    };

    const newRiskLevel = mapping[stressLevel] || 'PENDING';

    // Auto-assign if borrower object is provided and risk is elevated
    if (borrower && ['HIGH_RISK', 'CRITICAL_RISK'].includes(newRiskLevel)) {
        await assignRegionalExecutive(borrower);
    }

    return newRiskLevel;
};
