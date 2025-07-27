// Import shared password configuration
import { getAllPasswords, isPasswordUsed, markPasswordAsUsed, getPasswordStats } from '../config/passwords.js';

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
    
    // Get passwords from shared config
    const validPasswords = getAllPasswords();
    
    // Check if password exists in our master list
    if (!validPasswords.includes(password)) {
        console.log('❌ Password not in master list:', password);
        return res.status(401).json({
            success: false,
            message: 'Invalid password'
        });
    }
    
    // Check if this specific password has been used before
    if (isPasswordUsed(password)) {
        const stats = getPasswordStats();
        console.log('🚫 Password already used:', password);
        console.log('Used passwords so far:', stats.usedPasswords);
        return res.status(403).json({
            success: false,
            message: 'This password has already been used and is no longer valid'
        });
    }
    
    // Password is valid and not used - mark it as used
    markPasswordAsUsed(password);
    const updatedStats = getPasswordStats();
    
    console.log('✅ SUCCESS! Password accepted and disabled:', password);
    console.log('Passwords used so far:', updatedStats.usedPasswords);
    console.log('Remaining passwords:', updatedStats.available);
    
    return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        timestamp: Date.now(),
        passwordUsed: password,
        remainingPasswords: updatedStats.available,
        totalUsedPasswords: updatedStats.used,
        usagePercentage: `${updatedStats.usagePercentage}%`
    });
}
