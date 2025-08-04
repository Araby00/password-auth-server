// Generate unique user keys
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { browserInfo, timestamp } = req.body;
    
    // Generate a unique key based on browser fingerprint
    const userKey = generateUserKey(browserInfo, timestamp);
    
    return res.json({
        success: true,
        userKey,
        message: 'User key generated'
    });
}

function generateUserKey(browserInfo, timestamp) {
    const data = JSON.stringify(browserInfo) + timestamp;
    // Simple hash function (use crypto.createHash in production)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return 'vfs_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
}
