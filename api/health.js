// api/health.js
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
    
    const healthData = {
        status: '✅ Server is online and working!',
        timestamp: new Date().toISOString(),
        message: 'Your password authentication server is running perfectly',
        server: 'Vercel Serverless Functions',
        uptime: 'Serverless (always available)',
        version: '1.0.0'
    };
    
    console.log('📊 Health check requested:', {
        timestamp: healthData.timestamp,
        status: 'healthy'
    });
    
    return res.status(200).json(healthData);
}
