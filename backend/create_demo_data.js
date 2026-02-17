import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = [
    {
        'Customer Name': 'Rajesh Kumar',
        'Email': 'rajesh@example.com',
        'Loan ID': 'LN-1001',
        'Phone Number': '9876543210',
        'Loan Amount': 50000,
        'Due Date': '2025-11-15',
        'Last Payment Date': '2025-10-10',
        'Overdue Days': 41
    },
    {
        'Customer Name': 'Suresh Raina',
        'Email': 'suresh@example.com',
        'Loan ID': 'LN-1002',
        'Phone Number': '8765432109',
        'Loan Amount': 75000,
        'Due Date': '2025-12-01',
        'Last Payment Date': '2025-11-05',
        'Overdue Days': 25
    },
    {
        'Customer Name': 'Amit Verma',
        'Email': 'amit@example.com',
        'Loan ID': 'LN-1003',
        'Phone Number': '7654321098',
        'Loan Amount': 25000,
        'Due Date': '2025-12-20',
        'Last Payment Date': '2025-11-20',
        'Overdue Days': 6
    },
    {
        'Customer Name': 'Sneha Reddy',
        'Email': 'sneha@example.com',
        'Loan ID': 'LN-1004',
        'Phone Number': '6543210987',
        'Loan Amount': 120000,
        'Due Date': '2025-10-01',
        'Last Payment Date': '2025-09-05',
        'Overdue Days': 86
    },
    {
        'Customer Name': 'Vikram Singh',
        'Email': 'vikram@example.com',
        'Loan ID': 'LN-1005',
        'Phone Number': '5432109876',
        'Loan Amount': 35000,
        'Due Date': '2025-12-25',
        'Last Payment Date': '2025-11-25',
        'Overdue Days': 1
    }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Borrowers');

const filePath = path.join(__dirname, 'demo_borrowers.xlsx');
XLSX.writeFile(workbook, filePath);

console.log(`Updated demo data with emails created at: ${filePath}`);
