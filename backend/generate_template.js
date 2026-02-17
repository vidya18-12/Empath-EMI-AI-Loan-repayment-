const XLSX = require('xlsx');
const path = require('path');

const headers = [
    'Loan Number',
    'Borrower Name',
    'Monthly Installment Amount 1',
    'Monthly Installment Principal 1',
    'Monthly Installment Interest 1',
    'Total Demand (Original Schedule)',
    'Current Month Demand',
    'Overdue',
    'Total Demand (OD + Current)',
    'Outstanding Loan Amount',
    'DPD',
    'Phone Number',
    'No. of Installments',
    'No. of Paid Installments',
    'Borrower Address',
    'Disbursal Date',
    'Principal',
    'Last Installment Date',
    'Last Repayment Date',
    'Email'
];

const data = [
    {
        'Loan Number': 'LN1001',
        'Borrower Name': 'John Doe',
        'Monthly Installment Amount 1': 5000,
        'Principal': 100000,
        'Outstanding Loan Amount': 85000,
        'DPD': 35,
        'Phone Number': '9876543210',
        'No. of Installments': 24,
        'No. of Paid Installments': 4,
        'Borrower Address': 'Flat 202, Sunshine Apts, Mumbai',
        'Disbursal Date': '2025-01-01',
        'Last Installment Date': '2025-02-01',
        'Last Repayment Date': '2025-02-05',
        'Email': 'john.doe@example.com'
    },
    {
        'Loan Number': 'LN1002',
        'Borrower Name': 'Jane Smith',
        'Monthly Installment Amount 1': 7500,
        'Principal': 200000,
        'Outstanding Loan Amount': 150000,
        'DPD': 65,
        'Phone Number': '9123456789',
        'No. of Installments': 36,
        'No. of Paid Installments': 8,
        'Borrower Address': 'H-12, Sector 15, Gurgaon',
        'Disbursal Date': '2024-10-01',
        'Last Installment Date': '2024-11-01',
        'Last Repayment Date': '2024-11-05',
        'Email': 'jane.smith@example.com'
    }
];

const ws = XLSX.utils.json_to_sheet(data, { header: headers });
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Borrowers');

const filePath = path.join(__dirname, 'borrower_template.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Sample template created at: ${filePath}`);
