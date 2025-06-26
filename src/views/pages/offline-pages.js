class OfflinePage {
    constructor() {
        this._title = 'Offline - StoryApps';
    }

    async render() {
        document.title = this._title;

        return `
            <section class="offline-page page-transition">
                <div class="coordinator-layout">
                    <div class="offline-content">
                        <div class="offline-icon">
                            <i class="fas fa-wifi-slash"></i>
                        </div>
                        
                        <h2>Anda Sedang Offline</h2>
                        <p>Koneksi internet tidak tersedia. Beberapa fitur mungkin terbatas.</p>
                        
                        <div class="offline-actions">
                            <button id="retry-connection" class="btn btn-primary">
                                <i class="fas fa-sync-alt"></i> Coba Lagi
                            </button>
                            <a href="#/" class="btn btn-secondary">
                                <i class="fas fa-home"></i> Kembali ke Beranda
                            </a>
                        </div>
                        
                        <div class="offline-info">
                            <h3>Yang Dapat Anda Lakukan:</h3>
                            <ul>
                                <li>Melihat cerita yang sudah dimuat sebelumnya</li>
                                <li>Melihat cerita favorit yang tersimpan</li>
                                <li>Navigasi antar halaman yang sudah dikunjungi</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this._bindEvents();
        this._checkConnectionStatus();
    }

    _bindEvents() {
        const retryButton = document.getElementById('retry-connection');
        
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this._retryConnection();
            });
        }

        // Listen for online/offline events
        window.addEventListener('online', () => {
            this._handleOnline();
        });

        window.addEventListener('offline', () => {
            this._handleOffline();
        });
    }

    _retryConnection() {
        const retryButton = document.getElementById('retry-connection');
        retryButton.disabled = true;
        retryButton.innerHTML = '<div class="loader"></div> Memeriksa...';

        // Simulate connection check
        setTimeout(() => {
            if (navigator.onLine) {
                this._handleOnline();
            } else {
                retryButton.disabled = false;
                retryButton.innerHTML = '<i class="fas fa-sync-alt"></i> Coba Lagi';
                this._showMessage('Koneksi masih tidak tersedia', 'error');
            }
        }, 2000);
    }

    _handleOnline() {
        this._showMessage('Koneksi tersedia! Mengalihkan...', 'success');
        
        setTimeout(() => {
            window.location.href = '#/';
            window.location.reload();
        }, 1500);
    }

    _handleOffline() {
        this._showMessage('Koneksi terputus', 'error');
    }

    _checkConnectionStatus() {
        if (navigator.onLine) {
            this._handleOnline();
        }
    }

    _showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessage = document.querySelector('.connection-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `connection-message connection-message-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        const offlineContent = document.querySelector('.offline-content');
        offlineContent.insertBefore(messageDiv, offlineContent.firstChild);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    beforeUnload() {
        // Remove event listeners
        window.removeEventListener('online', this._handleOnline);
        window.removeEventListener('offline', this._handleOffline);
    }
}

export { OfflinePage };

