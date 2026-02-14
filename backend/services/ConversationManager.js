/**
 * ConversationManager - State management for AI conversations
 * Handles persistent-like behavior for chat history in-memory
 */

class ConversationManager {
    constructor() {
        this.conversations = new Map(); // sessionId -> conversation
    }

    /**
     * Create a new conversation session
     * @param {string} sessionId 
     * @param {Object} context 
     */
    createConversation(sessionId, context = {}) {
        const conversation = {
            id: sessionId,
            createdAt: Date.now(),
            lastActivity: Date.now(),
            context: context, // {chapterId, problemId, promptId}
            messages: [],
            metadata: {
                totalMessages: 0,
                apiProvider: null
            }
        };

        this.conversations.set(sessionId, conversation);
        return conversation;
    }

    /**
     * Add a message to an existing conversation
     * @param {string} sessionId 
     * @param {string} role - 'user' or 'assistant'
     * @param {string} content 
     */
    addMessage(sessionId, role, content) {
        let conversation = this.conversations.get(sessionId);

        // Auto-create if not exists
        if (!conversation) {
            conversation = this.createConversation(sessionId);
        }

        const message = {
            role: role,
            content: content,
            timestamp: Date.now()
        };

        conversation.messages.push(message);
        conversation.lastActivity = Date.now();
        conversation.metadata.totalMessages++;

        return message;
    }

    /**
     * Get formatted messages for AI consumption
     * @param {string} sessionId 
     * @param {boolean} includeSystem 
     * @param {Object} tierLimits 
     */
    getMessagesForAI(sessionId, includeSystem = true, tierLimits = {}) {
        const conversation = this.conversations.get(sessionId);

        if (!conversation) {
            return [];
        }

        let messages = conversation.messages;

        // Support for Tier-based history restrictions
        if (tierLimits.conversationHistory === false) {
            // Basic Tier: Return only the very last user message to prevent context bleed
            const userMessages = messages.filter(m => m.role === 'user');
            const lastUserMessage = userMessages[userMessages.length - 1];
            return lastUserMessage ? [{ role: 'user', content: lastUserMessage.content }] : [];
        }

        // Standard behavior: Return full history
        return messages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user', // normalize roles for various APIs
            content: msg.content
        }));
    }

    /**
     * Check if a session exists
     */
    hasConversation(sessionId) {
        return this.conversations.has(sessionId);
    }

    /**
     * Cleanup old sessions to free memory
     * @param {number} maxAgeMs 
     */
    cleanupOldConversations(maxAgeMs = 3600000) { // Default 1 hour
        const now = Date.now();
        let count = 0;
        for (const [sessionId, conversation] of this.conversations.entries()) {
            if (now - conversation.lastActivity > maxAgeMs) {
                this.conversations.delete(sessionId);
                count++;
            }
        }
        if (count > 0) console.log(`[ConversationManager] Cleaned up ${count} stale sessions.`);
    }
}

// Singleton instance
const conversationManager = new ConversationManager();

// Periodic cleanup every 10 minutes
setInterval(() => {
    conversationManager.cleanupOldConversations();
}, 600000);

module.exports = conversationManager;
