// Simple admin panel to check password status
const passwords = [
    'mypassword123',
    'secret456', 
    'access789',
    'unlock2024',
    'key555',
    'script999',
    'auth777',
    'pass111',
    'code444',
    'magic888'
];

// This won't persist between server restarts since it's in memory
// For production, you'd use a database
let usedPasswords = new Set();

export default function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Create password status report
    const passwordStatus = passwords.map(pwd => ({
        password: pwd,
        status: usedPasswords.has(pwd) ? '❌ USED' : '✅ Available'
    }));
    
    return res.status(200).json({
        title: '🔐 Password Status Report',
        totalPasswords: passwords.length,
        usedPasswords: usedPasswords.size,
        availablePasswords: passwords.length - usedPasswords.size,
        passwords: passwordStatus,
        lastUpdated: new Date().toISOString(),
        note: 'Password usage resets when server restarts'
    });
}
