import FieldExecutive from '../models/FieldExecutive.js';

/**
 * Automatically assigns a field executive to a borrower based on location
 * @param {Object} borrower - The borrower model instance
 * @returns {Promise<Object|null>} - The assigned executive or null
 */
export const assignRegionalExecutive = async (borrower) => {
    try {
        if (!borrower.address) {
            console.log(`[ASSIGN] No address found for borrower ${borrower.customerName}`);
            return null;
        }

        // List of operational cities requested by user
        const operationalCities = [
            'Bengaluru', 'Mysuru', 'Udupi',
            'Shivamogga', 'Belagavi', 'Mangaluru', 'Hubballi'
        ];

        // Find which city mentions are in the address (case-insensitive)
        const address = borrower.address.toLowerCase();
        const matchedCity = operationalCities.find(city =>
            address.includes(city.toLowerCase())
        );

        if (!matchedCity) {
            console.log(`[ASSIGN] No operational city match found in address: "${borrower.address}"`);
            return null;
        }

        // Find the executive for this specific location
        const executive = await FieldExecutive.findOne({ location: matchedCity });

        if (executive) {
            borrower.assignedFieldExecutive = executive._id;
            console.log(`[ASSIGN] Successfully linked ${borrower.customerName} to ${executive.name} in ${matchedCity}`);
            return executive;
        }

        return null;
    } catch (error) {
        console.error('[ASSIGN] Error in auto-assignment logic:', error);
        return null;
    }
};
