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

// Track used passwords (in memory - resets when server restarts)
// For permanent storage, you'd need a database
let usedPasswords = new Set();

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
    
    const { password, timestamp, userAgent, domain } = req.body;
    
    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required'
        });
    }
    
    // Log the attempt
    console.log('🔐 Authentication attempt:', {
        password: password ? '***' : 'empty',
        domain: domain || 'unknown',
        timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
        userAgent: userAgent ? userAgent.substring(0, 50) + '...' : 'unknown'
    });
    
    // Check if password exists in our list
    if (!passwords.includes(password)) {
        console.log('❌ Invalid password:', password);
        return res.status(401).json({
            success: false,
            message: 'Invalid password'
        });
    }
    
    // Check if password has already been used
    if (usedPasswords.has(password)) {
        console.log('🚫 Password already used:', password);
        return res.status(403).json({
            success: false,
            message: 'This password has already been used and is no longer valid'
        });
    }
    
    // Password is valid and not used - mark it as used
    usedPasswords.add(password);
    
    console.log('✅ Authentication successful!');
    console.log('Password used and disabled:', password);
    console.log('Remaining passwords:', passwords.length - usedPasswords.size);
    console.log('Used passwords so far:', Array.from(usedPasswords));
    
    return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        timestamp: Date.now(),
        remainingPasswords: passwords.length - usedPasswords.size
    });
}
