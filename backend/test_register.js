import axios from 'axios';

const test = async () => {
    try {
        console.log('Testing Manager Registration...');
        const res1 = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test Manager',
            email: 'testmanager' + Date.now() + '@example.com',
            password: 'password123',
            role: 'manager'
        });
        console.log('Manager Registration Success:', res1.data.success);

        console.log('\nTesting Missing Borrower Registration...');
        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                name: 'New Borrower',
                email: 'newborrower@example.com',
                password: 'password123',
                role: 'user',
                phone: '0000000000'
            });
        } catch (err) {
            console.log('Missing Borrower (Expected 400):', err.response?.status, err.response?.data);
        }

        console.log('\nTesting Existing Borrower (Suresh) Registration...');
        // We know Suresh is in DB with suresh.raina@example.com but password might be set.
        // Let's use Amit Verma who likely has no password.
        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Amit Verma',
                email: 'amit@example.com',
                password: 'password123',
                role: 'user',
                phone: '7654321098'
            });
            console.log('Amit Registration Success');
        } catch (err) {
            console.log('Amit Registration Error:', err.response?.status, err.response?.data);
        }

    } catch (error) {
        console.error('Unexpected error:', error.message);
    }
};

test();
