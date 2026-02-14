/**
 * Tier Configuration - AISBP Platform tiers and limits
 */

const TIERS = {
    BASIC: {
        id: 'basic',
        name: 'Basic (Free)',
        limits: {
            messagesPerSession: 5,
            conversationHistory: false, // History only for the very last message
            maxTokensPerRequest: 1000,
            rateLimitPerIP: 20,
            rateLimitWindow: 86400000, // 24h
            allowedModes: ['mock'] // Only simulation by default
        },
        features: {
            mockData: true,
            llmAccess: false,
            conversationHistory: false,
            exportResults: true
        }
    },

    CUSTOM_KEY: {
        id: 'custom_key',
        name: 'Bring Your Own Key',
        limits: {
            messagesPerSession: Infinity,
            conversationHistory: true,
            maxTokensPerRequest: 4096,
            rateLimitPerIP: null,
            rateLimitWindow: null,
            allowedModes: ['mock', 'llm'] // Both allowed
        },
        features: {
            mockData: true,
            llmAccess: true,
            conversationHistory: true,
            exportResults: true,
            persistentStorage: true
        }
    }
};

/**
 * Determine user tier based on provided data (e.g., presence of API key)
 * @param {Object} userData 
 * @returns {Object} Tier object
 */
function getUserTier(userData = {}) {
    // If user provides a custom API key, they get "Power User" (CUSTOM_KEY) tier
    if (userData._apiKey && userData._apiKey.trim().length > 20) {
        return TIERS.CUSTOM_KEY;
    }

    // Default to Basic
    return TIERS.BASIC;
}

module.exports = { TIERS, getUserTier };
