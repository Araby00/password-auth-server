import { getUsedPasswords, addUsedPassword, isPasswordUsed, getStateInfo } from './shared-state.js';

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
    
    const { password, timestamp, userAgent, domain } = req.body;
    
    // Log the attempt
    console.log('🔐 Password attempt:', {
        password: password ? password : 'empty',
        domain: domain || 'unknown',
        timestamp: new Date().toISOString()
    });
    
    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required'
        });
    }
    
    // Check if password exists in our original list
    if (!passwords.includes(password)) {
        console.log('❌ Password not in list:', password);
        return res.status(401).json({
            success: false,
            message: 'Invalid password'
        });
    }
    
    // Check if this specific password has been used before using shared state
    if (isPasswordUsed(password)) {
        const stateInfo = getStateInfo();
        console.log('🚫 Password already used:', password);
        console.log('Used passwords so far:', stateInfo.usedPasswords);
        return res.status(403).json({
            success: false,
            message: 'This password has already been used and is no longer valid'
        });
    }
    
    // Password is valid and not used - mark it as used in shared state
    addUsedPassword(password);
    const stateInfo = getStateInfo();
    
    console.log('✅ SUCCESS! Password accepted and disabled:', password);
    console.log('Passwords used so far:', stateInfo.usedPasswords);
    console.log('Remaining passwords:', passwords.length - stateInfo.usedCount);
    
    return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        timestamp: Date.now(),
        passwordUsed: password,
        remainingPasswords: passwords.length - stateInfo.usedCount,
        totalUsedPasswords: stateInfo.usedCount
    });
}
