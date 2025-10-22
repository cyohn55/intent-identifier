/**
 * Frontend Configuration
 *
 * IMPORTANT: Update BACKEND_API_URL with your server's public URL
 *
 * For local testing: http://localhost:3000
 * For production: Your server's public URL (e.g., http://your-ip:3000 or https://your-domain.com)
 */

const API_CONFIG = {
    // ============================================
    // Auto-detect backend URL based on current origin
    // This allows the same config to work locally and through tunnels
    // ============================================
    get BACKEND_API_URL() {
        // Use the current origin (works for both localhost and tunnel URLs)
        return window.location.origin;
    },

    // API Endpoints (automatically constructed)
    get HEALTH_ENDPOINT() {
        return `${this.BACKEND_API_URL}/api/health`;
    },
    get CLASSIFY_ENDPOINT() {
        return `${this.BACKEND_API_URL}/api/classify`;
    },
    get CATEGORIES_ENDPOINT() {
        return `${this.BACKEND_API_URL}/api/categories`;
    },
    get BATCH_CLASSIFY_ENDPOINT() {
        return `${this.BACKEND_API_URL}/api/classify-batch`;
    }
};

// Make config available globally
window.API_CONFIG = API_CONFIG;
