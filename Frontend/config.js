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
    // BACKEND SERVER URL (Port Forwarding Setup)
    // ============================================
    // GitHub Pages frontend → Local backend via public IP
    BACKEND_API_URL: 'http://72.72.161.84:8888',

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
