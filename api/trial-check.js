// Vercel serverless function for trial verification
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, scriptVersion } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
    }

    try {
        // In production, use a database. For demo, using simple storage
        const trialData = await getTrialData(userId);
        const currentTime = Date.now();
        
        if (!trialData) {
            // First time user - start trial
            const newTrial = {
                userId,
                startTime: currentTime,
                totalUsedTime: 0,
                trialDuration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
                isActive: true,
                scriptVersion
            };
            
            await saveTrialData(userId, newTrial);
            
            return res.json({
                success: true,
                isTrialActive: true,
                remainingTime: newTrial.trialDuration,
                message: 'Trial started - 7 days remaining'
            });
        }

        // Calculate total elapsed time since trial start
        const totalElapsedTime = currentTime - trialData.startTime;
        
        if (totalElapsedTime >= trialData.trialDuration) {
            // Trial expired
            await saveTrialData(userId, { ...trialData, isActive: false });
            
            return res.json({
                success: true,
                isTrialActive: false,
                remainingTime: 0,
                message: 'Trial expired. Please purchase the full version.'
            });
        }

        // Trial still active
        const remainingTime = trialData.trialDuration - totalElapsedTime;
        
        return res.json({
            success: true,
            isTrialActive: true,
            remainingTime,
            message: `Trial active - ${Math.ceil(remainingTime / (24 * 60 * 60 * 1000))} days remaining`
        });

    } catch (error) {
        console.error('Trial check error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Simple storage functions (replace with database in production)
async function getTrialData(userId) {
    // In production, query your database
    // For now, using a simple in-memory approach
    // You should implement persistent storage
    return null; // Placeholder
}

async function saveTrialData(userId, data) {
    // In production, save to your database
    // For now, this is a placeholder
    console.log('Saving trial data:', userId, data);
}
