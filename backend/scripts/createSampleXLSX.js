import XLSX from 'xlsx';
import fs from 'fs';

// Sample borrower data
const sampleData = [
    {
        'Customer Name': 'Rajesh Kumar',
        'Loan ID': 'LN2024001',
        'Phone Number': '9876543210',
        'Loan Amount': 50000,
        'Due Date': '11/15/2024',
        'Last Payment Date': '9/15/2024',
        'Overdue Days': 35,
    },
    {
        'Customer Name': 'Priya Sharma',
        'Loan ID': 'LN2024002',
        'Phone Number': '9876543211',
        'Loan Amount': 75000,
        'Due Date': '12/1/2024',
        'Last Payment Date': '10/1/2024',
        'Overdue Days': 20,
    },
    {
        'Customer Name': 'Amit Patel',
        'Loan ID': 'LN2024003',
        'Phone Number': '9876543212',
        'Loan Amount': 100000,
        'Due Date': '10/25/2024',
        'Last Payment Date': '8/25/2024',
        'Overdue Days': 55,
    },
    {
        'Customer Name': 'Sneha Reddy',
        'Loan ID': 'LN2024004',
        'Phone Number': '9876543213',
        'Loan Amount': 30000,
        'Due Date': '12/10/2024',
        'Last Payment Date': '11/10/2024',
        'Overdue Days': 10,
    },
    {
        'Customer Name': 'Vikram Singh',
        'Loan ID': 'LN2024005',
        'Phone Number': '9876543214',
        'Loan Amount': 120000,
        'Due Date': '11/1/2024',
        'Last Payment Date': '9/1/2024',
        'Overdue Days': 50,
    },
    {
        'Customer Name': 'Ananya Iyer',
        'Loan ID': 'LN2024006',
        'Phone Number': '9876543215',
        'Loan Amount': 45000,
        'Due Date': '11/20/2024',
        'Last Payment Date': '9/20/2024',
        'Overdue Days': 30,
    },
    {
        'Customer Name': 'Rohan Mehta',
        'Loan ID': 'LN2024007',
        'Phone Number': '9876543216',
        'Loan Amount': 85000,
        'Due Date': '10/15/2024',
        'Last Payment Date': '8/15/2024',
        'Overdue Days': 65,
    },
];

// Create worksheet
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Create workbook
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Borrowers');

// Write to file
XLSX.writeFile(workbook, 'sample_borrower_data.xlsx');

console.log('✅ Sample XLSX file created: sample_borrower_data.xlsx');
