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
    // Backend URL Configuration
    // For GitHub Pages: points to Cloudflare Tunnel backend
    // For local/tunnel deployment: auto-detects from current origin
    // ============================================
    get BACKEND_API_URL() {
        // If on GitHub Pages, use the Cloudflare tunnel backend
        if (window.location.hostname.includes('github.io')) {
            return 'https://influence-organisations-jurisdiction-fame.trycloudflare.com';
        }
        // Otherwise, use the current origin (works for localhost and tunnel URLs)
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
