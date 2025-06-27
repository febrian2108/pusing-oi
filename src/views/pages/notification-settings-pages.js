import { NotificationHelper } from '../../utils/notification-helper.js';
import { AuthHelper } from '../../utils/auth-helper.js';

class NotificationSettingsPage {
    constructor() {
        this._title = 'Pengaturan Notifikasi - StoryApps';
        this._isSubscribed = false;
        this._registration = null;
    }

    async render() {
        document.title = this._title;

        return `
            <section class="notification-settings-page page-transition">
                <div class="notification-settings-content">
                    <div class="page-header">
                        <h2>Pengaturan Notifikasi</h2>
                        <p>Kelola preferensi notifikasi Anda</p>
                    </div>

                    <div class="notification-card">
                        <div class="notification-info">
                            <h3>Push Notifications</h3>
                            <p>Terima notifikasi real-time tentang cerita baru dan pembaruan aplikasi</p>
                        </div>
                        <br>
                        
                        <div class="notification-status" id="notification-status">
                            <span class="status-loading">Memeriksa status...</span>
                        </div>
                        
                        <br>
                        <div class="notification-actions">
                            <button id="enable-notifications" class="btn btn-primary">
                                <i class="fas fa-bell"></i>
                                <span>Aktifkan Notifikasi</span>
                            </button>
                            <button id="disable-notifications" class="btn btn-secondary">
                                <i class="fas fa-bell-slash"></i>
                                <span>Nonaktifkan Notifikasi</span>
                            </button>
                            <button id="test-notification" class="btn btn-outline">
                                <i class="fas fa-bell"></i>
                                <span>Test Notifikasi</span>
                            </button>
                            
                        </div>
                    </div>
                    <br>

                    <div class="notification-help">
                        <h4>Bantuan Notifikasi</h4>
                        <ul>
                            <li>Pastikan browser Anda mendukung notifikasi</li>
                            <li>Izinkan notifikasi saat diminta oleh browser</li>
                            <li>Notifikasi akan muncul bahkan saat aplikasi tidak terbuka</li>
                            <li>Anda dapat mengatur notifikasi di pengaturan browser</li>
                        </ul>
                    </div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        if (!AuthHelper.isLoggedIn()) {
            this._showLoginRequired();
            return;
        }

        await this._checkNotificationStatus();
        this._setupEventListeners();
    }

    async _checkNotificationStatus() {
        const statusElement = document.getElementById('notification-status');
        const enableBtn = document.getElementById('enable-notifications');
        const disableBtn = document.getElementById('disable-notifications');

        if (!('Notification' in window)) {
            statusElement.innerHTML = '<span class="status-error">Browser tidak mendukung notifikasi</span>';
            enableBtn.disabled = true;
            disableBtn.disabled = true;
            return;
        }

        if (Notification.permission === 'denied') {
            statusElement.innerHTML = '<span class="status-error">Notifikasi diblokir oleh browser</span>';
            enableBtn.disabled = true;
            disableBtn.disabled = true;
            return;
        }

        if (Notification.permission === 'default') {
            statusElement.innerHTML = '<span class="status-inactive">Izin notifikasi belum diberikan</span>';
            enableBtn.disabled = false;
            disableBtn.disabled = true;
            return;
        }

        if (Notification.permission === 'granted') {
            try {
                const registration = await navigator.serviceWorker.ready;
                const isSubscribed = await NotificationHelper.getSubscriptionStatus(registration);
                
                if (isSubscribed) {
                    statusElement.innerHTML = '<span class="status-active">Notifikasi aktif</span>';
                    enableBtn.disabled = true;
                    disableBtn.disabled = false;
                } else {
                    statusElement.innerHTML = '<span class="status-inactive">Notifikasi tidak aktif</span>';
                    enableBtn.disabled = false;
                    disableBtn.disabled = true;
                }
            } catch (error) {
                console.error('Error checking subscription status:', error);
                statusElement.innerHTML = '<span class="status-error">Error memeriksa status</span>';
            }
        }
    }

    _setupEventListeners() {
        const enableBtn = document.getElementById('enable-notifications');
        const disableBtn = document.getElementById('disable-notifications');
        const testBtn = document.getElementById('test-notification');
        const testPushBtn = document.getElementById('test-push');

        enableBtn.addEventListener('click', async () => {
            try {
                const registration = await navigator.serviceWorker.ready;
                const permission = await NotificationHelper.requestPermission();
                
                if (permission) {
                    await NotificationHelper.subscribePushNotification(registration);
                    await this._checkNotificationStatus();
                    this._showSuccessMessage('Notifikasi berhasil diaktifkan!');
                }
            } catch (error) {
                console.error('Error enabling notifications:', error);
                this._showErrorMessage('Gagal mengaktifkan notifikasi: ' + error.message);
            }
        });

        disableBtn.addEventListener('click', async () => {
            try {
                const registration = await navigator.serviceWorker.ready;
                await NotificationHelper.unsubscribePushNotification(registration);
                await this._checkNotificationStatus();
                this._showSuccessMessage('Notifikasi berhasil dinonaktifkan!');
            } catch (error) {
                console.error('Error disabling notifications:', error);
                this._showErrorMessage('Gagal menonaktifkan notifikasi: ' + error.message);
            }
        });

        testBtn.addEventListener('click', async () => {
            try {
                const success = await NotificationHelper.testNotification();
                if (success) {
                    this._showSuccessMessage('Test notifikasi berhasil dikirim!');
                } else {
                    this._showErrorMessage('Gagal mengirim test notifikasi');
                }
            } catch (error) {
                console.error('Error testing notification:', error);
                this._showErrorMessage('Error testing notification: ' + error.message);
            }
        });

        testPushBtn.addEventListener('click', async () => {
            try {
                const success = await NotificationHelper.testPushNotification();
                if (success) {
                    this._showSuccessMessage('Push subscription siap untuk testing!');
                } else {
                    this._showErrorMessage('Gagal test push notification');
                }
            } catch (error) {
                console.error('Error testing push notification:', error);
                this._showErrorMessage('Error testing push notification: ' + error.message);
            }
        });
    }

    _showLoginRequired() {
        const statusElement = document.getElementById('notification-status');
        statusElement.innerHTML = `
            <div class="status-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Silakan login terlebih dahulu</span>
            </div>
        `;
    }

    _showNotSupported() {
        const statusElement = document.getElementById('notification-status');
        statusElement.innerHTML = `
            <div class="status-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Browser tidak mendukung notifikasi push</span>
            </div>
        `;
    }

    _showError(message) {
        const statusElement = document.getElementById('notification-status');
        statusElement.innerHTML = `
            <div class="status-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;
    }

    _showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'notification-success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    _showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'notification-error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    beforeUnload() {
        // Cleanup if needed
    }
}

export { NotificationSettingsPage };

