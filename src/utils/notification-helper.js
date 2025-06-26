class NotificationHelper {
    static async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker tidak didukung di browser ini');
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.register('./sw.js', {
                scope: './',
            });
            console.log('Service Worker berhasil didaftarkan', registration);
            return registration;
        } catch (error) {
            console.error('Registrasi Service Worker gagal:', error);
            return null;
        }
    }

    static async requestPermission() {
        if (!('Notification' in window)) {
            console.log('Browser tidak mendukung notifikasi');
            return false;
        }

        const result = await Notification.requestPermission();
        if (result === 'denied') {
            console.log('Fitur notifikasi tidak diizinkan');
            return false;
        }

        if (result === 'default') {
            console.log('Pengguna menutup kotak dialog permintaan izin');
            return false;
        }

        return true;
    }

    static async getVapidPublicKey() {
        return 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
    }

    static async subscribePushNotification(registration) {
        if (!registration.active) {
            console.error('Service Worker tidak aktif');
            return;
        }

        const vapidPublicKey = await this.getVapidPublicKey();
        const convertedVapidKey = this._urlBase64ToUint8Array(vapidPublicKey);

        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey,
            });

            console.log('Berhasil melakukan subscribe dengan endpoint:', subscription.endpoint);
            await this._sendSubscriptionToServer(subscription);
            return subscription;
        } catch (error) {
            console.error('Gagal melakukan subscribe:', error);
            return null;
        }
    }

    static async _sendSubscriptionToServer(subscription) {
        try {
            const { AuthConfig } = await import('../config/auth-config.js');
            const authConfig = new AuthConfig();
            
            // Convert keys to base64 string format
            const p256dhKey = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh'))));
            const authKey = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))));
            
            const formattedSubscription = {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: p256dhKey,
                    auth: authKey
                }
            };
            
            await authConfig.subscribeNotification(formattedSubscription);
            console.log('Berhasil mengirim subscription ke server');
            return formattedSubscription;
        } catch (error) {
            console.error('Gagal mengirim subscription ke server:', error);
            throw error;
        }
    }

    static async unsubscribePushNotification(registration) {
        try {
            const subscription = await registration.pushManager.getSubscription();
            
            if (!subscription) {
                console.log('Tidak ada subscription yang aktif');
                return false;
            }

            // Unsubscribe dari server
            const { AuthConfig } = await import('../config/auth-config.js');
            const authConfig = new AuthConfig();
            await authConfig.unsubscribeNotification(subscription.endpoint);

            // Unsubscribe dari browser
            const successful = await subscription.unsubscribe();
            
            if (successful) {
                console.log('Berhasil unsubscribe dari push notification');
            } else {
                console.log('Gagal unsubscribe dari push notification');
            }
            
            return successful;
        } catch (error) {
            console.error('Error unsubscribing from push notification:', error);
            return false;
        }
    }

    static async getSubscriptionStatus(registration) {
        try {
            const subscription = await registration.pushManager.getSubscription();
            return subscription !== null;
        } catch (error) {
            console.error('Error checking subscription status:', error);
            return false;
        }
    }

    static _urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; i++) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    static showNotification(title, options) {
        if (!('Notification' in window)) {
            console.log('Browser tidak mendukung notifikasi');
            return;
        }

        if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, options);
            });
        } else {
            console.log('Izin notifikasi tidak diberikan');
            alert('Anda belum memberikan izin untuk menerima notifikasi.');
        }
    }

    static async testNotification() {
        if (!('Notification' in window)) {
            console.log('Browser tidak mendukung notifikasi');
            return false;
        }

        if (Notification.permission !== 'granted') {
            console.log('Izin notifikasi tidak diberikan');
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification('Test Notification', {
                body: 'Ini adalah notifikasi test dari StoryApps',
                icon: './src/public/icons/icon-192x192.png',
                badge: './src/public/icons/badge-96x96.png',
                vibrate: [100, 50, 100],
                tag: 'test-notification'
            });
            console.log('Test notification sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending test notification:', error);
            return false;
        }
    }

    static async testPushNotification() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (!subscription) {
                console.log('No push subscription found');
                return false;
            }

            // Simulate a push message with text data
            const testData = 'Test push notification from StoryApps';
            const pushData = new Blob([testData], { type: 'text/plain' });
            
            // This would normally be sent from the server
            // For testing, we'll just log the subscription details
            console.log('Push subscription details:', {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
                    auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
                }
            });
            
            console.log('Push subscription is ready for testing');
            return true;
        } catch (error) {
            console.error('Error testing push notification:', error);
            return false;
        }
    }
}

export { NotificationHelper };
