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

// Create a simple hash function to track device+password combinations
function createDevicePasswordHash(password, userAgent, ip) {
    const deviceInfo = (ip || 'unknown') + '_' + (userAgent || 'unknown');
    return Buffer.from(password + '_' + deviceInfo).toString('base64');
}

// In-memory storage (will reset on server restart - that's actually good for security)
let usedDevicePasswordCombinations = new Set();

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
    
    // Get client IP
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.connection?.remoteAddress || 
                    'unknown';
    
    // Check if password exists in our list
    if (!passwords.includes(password)) {
        console.log('❌ Invalid password:', password);
        return res.status(401).json({
            success: false,
            message: 'Invalid password'
        });
    }
    
    // Create unique hash for this device+password combination
    const devicePasswordHash = createDevicePasswordHash(password, userAgent, clientIP);
    
    // Check if this specific device has already used this password
    if (usedDevicePasswordCombinations.has(devicePasswordHash)) {
        console.log('🚫 Password already used by this device:', password);
        return res.status(403).json({
            success: false,
            message: 'This password has already been used on this device'
        });
    }
    
    // Mark this device+password combination as used
    usedDevicePasswordCombinations.add(devicePasswordHash);
    
    console.log('✅ Authentication successful!');
    console.log('Password used:', password);
    console.log('Device hash:', devicePasswordHash.substring(0, 10) + '...');
    console.log('Total device+password combinations used:', usedDevicePasswordCombinations.size);
    
    return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        timestamp: Date.now(),
        note: 'Password can still be used on other devices'
    });
}
