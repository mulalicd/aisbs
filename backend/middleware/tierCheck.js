/**
 * Tier Check Middleware - Enforces usage limits based on user tiers
 */

const { getUserTier } = require('../config/tiers');
const conversationManager = require('../services/ConversationManager');

// In-memory rate limiting store (cleared on restart)
const rateLimitStore = new Map();

function tierCheckMiddleware(req, res, next) {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  🛡️  TIER CHECK MIDDLEWARE                              ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('[TierCheck] Request received');
    console.log('[TierCheck] Body:', JSON.stringify(req.body, null, 2));

    const { userData = {}, mode = 'mock' } = req.body;

    // 1. Determine user tier
    const tier = getUserTier(userData);
    req.userTier = tier; // Store in request for downstream use

    // 2. Mode Access Verification
    if (!tier.limits.allowedModes.includes(mode)) {
        return res.status(403).json({
            success: false,
            error: 'tier_limit_exceeded',
            errorType: 'MODAL_UPGRADE_REQUIRED',
            message: `The ${mode.toUpperCase()} mode requires a Custom API key. Your current tier (${tier.name}) is restricted to simulation mode only.`,
            currentTier: tier.id,
            upgradeRequired: true
        });
    }

    // 3. Rate Limiting (IP-based)
    if (tier.id === 'basic' && tier.limits.rateLimitPerIP) {
        const clientIp = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        let ipData = rateLimitStore.get(clientIp);
        if (!ipData) {
            ipData = { requests: [], firstRequest: now };
            rateLimitStore.set(clientIp, ipData);
        }

        // Slide window: remove requests older than the window
        ipData.requests = ipData.requests.filter(timestamp => (now - timestamp) < tier.limits.rateLimitWindow);

        if (ipData.requests.length >= tier.limits.rateLimitPerIP) {
            return res.status(429).json({
                success: false,
                error: 'rate_limit_exceeded',
                errorType: 'MODAL_UPGRADE_REQUIRED',
                message: `Daily execution limit (${tier.limits.rateLimitPerIP} requests) reached for this IP. Add your own API key to bypass limits.`,
                currentTier: tier.id,
                upgradeRequired: true
            });
        }

        // Log this request
        ipData.requests.push(now);
    }

    // 4. Session Message Count Check
    if (tier.id === 'basic' && userData._sessionId) {
        if (conversationManager.hasConversation(userData._sessionId)) {
            const conversation = conversationManager.conversations.get(userData._sessionId);
            const userMessages = conversation.messages.filter(m => m.role === 'user').length;

            if (userMessages >= tier.limits.messagesPerSession) {
                return res.status(403).json({
                    success: false,
                    error: 'session_limit_exceeded',
                    errorType: 'MODAL_UPGRADE_REQUIRED',
                    message: `Session limit of ${tier.limits.messagesPerSession} questions reached. Add your own API key to unlock unlimited conversation depth.`,
                    currentTier: tier.id,
                    upgradeRequired: true
                });
            }
        }
    }

    // All checks passed
    next();
}

/**
 * Periodic cleanup of memory store
 */
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
        if (data.requests.length === 0 || (now - data.requests[data.requests.length - 1]) > 86400000) {
            rateLimitStore.delete(ip);
        }
    }
}, 600000); // 10 minutes

module.exports = tierCheckMiddleware;
