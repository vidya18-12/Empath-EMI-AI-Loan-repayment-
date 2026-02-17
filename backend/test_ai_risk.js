import axios from 'axios';

const test = async () => {
    try {
        const API_URL = 'http://localhost:5000/api';

        console.log('Logging in as Suresh Raina...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'suresh.raina@example.com',
            password: 'password123',
            role: 'user'
        });

        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('Sending crisis message...');
        const msgRes = await axios.post(`${API_URL}/messages`, {
            recipientId: loginRes.data.user.id, // In this system, borrowers often send to their assigned manager, but the controller handles finding the recipient if not provided? No, it expects recipientId.
            content: 'I lost my job and have no money to pay the loan. This is a crisis.'
        }, config);

        console.log('Message sent. Waiting for AI to process...');
        await new Promise(r => setTimeout(r, 2000));

        console.log('Checking updated risk level...');
        const borrowerRes = await axios.get(`${API_URL}/borrowers?search=suresh.raina@example.com`, config);
        const b = borrowerRes.data.data[0];
        console.log('New Risk Level:', b.riskLevel);

        console.log('Checking for AI EMI Recommendation...');
        const recRes = await axios.get(`${API_URL}/borrowers/${b._id}/latest-recommendation`, config);
        if (recRes.data.data) {
            console.log('AI Recommendation:', recRes.data.data.riskLevel, 'EMI:', recRes.data.data.suggestedEMI);
        } else {
            console.log('No recommendation found.');
        }

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
};

test();
