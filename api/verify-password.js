// api/verify-password.js - Enhanced with Trial System

const ADMIN_PASSWORD = "ARABY11"; // Change this!

// In-memory storage (use database in production)
let deviceDatabase = {
    // Example structure:
    // "device_123": {
    //     deviceId: "device_123",
    //     firstAccess: "2025-01-01T00:00:00.000Z",
    //     trialDuration: 24, // hours
    //     status: "active", // "active", "expired", "permanent", "blocked"
    //     lastUsed: "2025-01-01T12:00:00.000Z",
    //     totalUsage: 5, // number of times accessed
    //     userAgent: "...",
    //     domain: "visa.vfsglobal.com"
    // }
};

// Global settings
let globalSettings = {
    defaultTrialHours: 24, // Default trial duration
    requireTrial: true, // Set to false to disable trial system
    masterSwitch: true // Master on/off switch
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { password, deviceId, userAgent, domain, action } = req.body;

        // Admin endpoints
        if (action === 'admin') {
            return handleAdminAction(req, res);
        }

        // Regular authentication
        if (req.method === 'POST') {
            return handleAuthentication(req, res);
        }

        // Get trial status endpoint
        if (req.method === 'GET') {
            return handleTrialStatus(req, res);
        }

        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error occurred',
            debug: error.message
        });
    }
}

async function handleAuthentication(req, res) {
    const { password, deviceId, userAgent, domain, timestamp } = req.body;

    // Validate required fields
    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required'
        });
    }

    // Check master switch
    if (!globalSettings.masterSwitch) {
        return res.status(403).json({
            success: false,
            message: 'Service temporarily unavailable'
        });
    }

    // Verify password
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({
            success: false,
            message: 'Invalid password'
        });
    }

    // Handle device registration and trial logic
    const device = deviceId || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Get or create device record
    if (!deviceDatabase[device]) {
        // First time access - start trial
        deviceDatabase[device] = {
            deviceId: device,
            firstAccess: now,
            trialDuration: globalSettings.defaultTrialHours,
            status: globalSettings.requireTrial ? 'active' : 'permanent',
            lastUsed: now,
            totalUsage: 1,
            userAgent: userAgent || 'Unknown',
            domain: domain || 'Unknown'
        };
    } else {
        // Update existing device
        deviceDatabase[device].lastUsed = now;
        deviceDatabase[device].totalUsage += 1;
    }

    const deviceData = deviceDatabase[device];

    // Check trial status
    const trialStatus = checkTrialStatus(deviceData);

    if (trialStatus.expired && deviceData.status !== 'permanent') {
        return res.status(403).json({
            success: false,
            message: 'Trial period has expired',
            trialInfo: trialStatus
        });
    }

    if (deviceData.status === 'blocked') {
        return res.status(403).json({
            success: false,
            message: 'Access has been blocked'
        });
    }

    // Success response
    return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        deviceId: device,
        trialInfo: trialStatus,
        timestamp: now
    });
}

async function handleAdminAction(req, res) {
    const { password, adminAction, deviceId, newStatus, trialHours, globalAction } = req.body;

    // Verify admin password
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({
            success: false,
            message: 'Invalid admin password'
        });
    }

    switch (adminAction) {
        case 'listDevices':
            return res.json({
                success: true,
                devices: Object.values(deviceDatabase),
                globalSettings: globalSettings
            });

        case 'updateDevice':
            if (!deviceId || !deviceDatabase[deviceId]) {
                return res.status(404).json({
                    success: false,
                    message: 'Device not found'
                });
            }

            if (newStatus) {
                deviceDatabase[deviceId].status = newStatus;
            }
            if (trialHours) {
                deviceDatabase[deviceId].trialDuration = parseInt(trialHours);
            }

            return res.json({
                success: true,
                message: 'Device updated successfully',
                device: deviceDatabase[deviceId]
            });

        case 'deleteDevice':
            if (!deviceId || !deviceDatabase[deviceId]) {
                return res.status(404).json({
                    success: false,
                    message: 'Device not found'
                });
            }

            delete deviceDatabase[deviceId];
            return res.json({
                success: true,
                message: 'Device deleted successfully'
            });

        case 'globalSettings':
            if (globalAction === 'masterOn') {
                globalSettings.masterSwitch = true;
            } else if (globalAction === 'masterOff') {
                globalSettings.masterSwitch = false;
            } else if (globalAction === 'setDefaultTrial' && trialHours) {
                globalSettings.defaultTrialHours = parseInt(trialHours);
            } else if (globalAction === 'toggleTrialRequirement') {
                globalSettings.requireTrial = !globalSettings.requireTrial;
            }

            return res.json({
                success: true,
                message: 'Global settings updated',
                settings: globalSettings
            });

        case 'stats':
            const stats = {
                totalDevices: Object.keys(deviceDatabase).length,
                activeTrials: Object.values(deviceDatabase).filter(d => d.status === 'active' && !checkTrialStatus(d).expired).length,
                expiredTrials: Object.values(deviceDatabase).filter(d => d.status === 'active' && checkTrialStatus(d).expired).length,
                permanentDevices: Object.values(deviceDatabase).filter(d => d.status === 'permanent').length,
                blockedDevices: Object.values(deviceDatabase).filter(d => d.status === 'blocked').length
            };

            return res.json({
                success: true,
                stats: stats,
                globalSettings: globalSettings
            });

        default:
            return res.status(400).json({
                success: false,
                message: 'Invalid admin action'
            });
    }
}

async function handleTrialStatus(req, res) {
    const { deviceId } = req.query;

    if (!deviceId || !deviceDatabase[deviceId]) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    const deviceData = deviceDatabase[deviceId];
    const trialStatus = checkTrialStatus(deviceData);

    return res.json({
        success: true,
        trialInfo: trialStatus,
        deviceStatus: deviceData.status
    });
}

function checkTrialStatus(deviceData) {
    const now = new Date();
    const firstAccess = new Date(deviceData.firstAccess);
    const trialEndTime = new Date(firstAccess.getTime() + (deviceData.trialDuration * 60 * 60 * 1000));
    
    const timeUsed = now - firstAccess;
    const timeRemaining = trialEndTime - now;
    
    const hoursUsed = Math.floor(timeUsed / (1000 * 60 * 60));
    const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
    const minutesRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));

    return {
        isPermanent: deviceData.status === 'permanent',
        isBlocked: deviceData.status === 'blocked',
        expired: timeRemaining <= 0 && deviceData.status !== 'permanent',
        trialDuration: deviceData.trialDuration,
        hoursUsed: hoursUsed,
        hoursRemaining: hoursRemaining,
        minutesRemaining: minutesRemaining,
        firstAccess: deviceData.firstAccess,
        lastUsed: deviceData.lastUsed,
        totalUsage: deviceData.totalUsage,
        trialEndTime: trialEndTime.toISOString()
    };
}
