// List of valid passwords
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

export default function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed' 
        });
    }
    
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required'
        });
    }
    
    // Check if password is valid
    if (passwords.includes(password)) {
        console.log('✅ Valid password used:', password);
        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            timestamp: Date.now()
        });
    } else {
        console.log('❌ Invalid password:', password);
        return res.status(401).json({
            success: false,
            message: 'Invalid password'
        });
    }
}
