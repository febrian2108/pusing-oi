import { routes } from './routes/routes.js';
import { UrlParser } from './utils/url-parse.js';
import { AuthHelper } from './utils/auth-helper.js';
import { IdbHelper } from './utils/indexed-db.js';
import { NotificationHelper } from './utils/notification-helper.js';
import { NetworkStatus } from './utils/network-status.js';
import { PwaInstaller } from './utils/pwa-installer.js';

window.selectedStoryId = null;
window.routes = routes; // Make routes globally available for debugging

class App {
  constructor() {
    this._currentPage = null;
    this._initializeApp();
  }

  async _initializeApp() {
    console.log('Initializing app...');

    await this._initIndexedDB();
    await this._initServiceWorker();
    PwaInstaller.init();

    await this._subscribeToPushNotification();

    this._checkAuthStatus();
    
    // Call _handleRoute after initialization
    await this._handleRoute();

    window.addEventListener('hashchange', () => {
      this._cleanupCurrentPage();
      this._handleRoute();
    });

    window.addEventListener('beforeunload', () => {
      this._cleanupCurrentPage();
    });

    document.addEventListener('click', (event) => {
      if (event.target.tagName === 'A' && event.target.href.includes('#/')) {
        if (document.startViewTransition) {
          event.preventDefault();
          document.startViewTransition(() => {
            window.location.href = event.target.href;
          });
        }
      }
    });
  }

  async _initServiceWorker() {
    try {
      console.log('Initializing Service Worker...');

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered successfully:', registration);

        registration.addEventListener('updatefound', () => {
          console.log('New service worker found, updating...');
        });

        if (AuthHelper.isLoggedIn()) {
          const permission = await NotificationHelper.requestPermission();

          if (permission && registration) {
            await NotificationHelper.subscribePushNotification(registration);
          }
        }

        return registration;
      } else {
        console.warn('Service Worker not supported');
        return null;
      }
    } catch (error) {
      console.error('Error initializing service worker:', error);
      return null;
    }
  }

  async _initIndexedDB() {
    try {
      await IdbHelper.openDB();
      console.log('IndexedDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  _checkAuthStatus() {
    console.log('Checking auth status...');
    const isLoggedIn = AuthHelper.isLoggedIn();
    const loginMenuItem = document.getElementById('login-menu');
    const registerMenuItem = document.getElementById('register-menu');
    const logoutMenuItem = document.getElementById('logout-menu');
    const favoritesMenuItem = document.querySelector('.nav-item a[href="#/favorites"]')?.parentElement;
    const addStoryMenuItem = document.querySelector('.nav-item a[href="#/add"]')?.parentElement;
    const mapMenuItem = document.querySelector('.nav-item a[href="#/map"]')?.parentElement;
    const notificationsMenuItem = document.querySelector('.nav-item a[href="#/notifications"]')?.parentElement;

    if (!loginMenuItem || !registerMenuItem || !logoutMenuItem) {
      console.error('Menu items not found');
      return;
    }

    if (isLoggedIn) {
      console.log('User is logged in');
      loginMenuItem.classList.add('hidden');
      registerMenuItem.classList.add('hidden');
      logoutMenuItem.classList.remove('hidden');

      if (favoritesMenuItem) favoritesMenuItem.classList.remove('hidden');
      if (addStoryMenuItem) addStoryMenuItem.classList.remove('hidden');
      if (mapMenuItem) mapMenuItem.classList.remove('hidden');
      if (notificationsMenuItem) notificationsMenuItem.classList.remove('hidden');

      this._subscribeToPushNotification();
    } else {
      console.log('User is not logged in');
      loginMenuItem.classList.remove('hidden');
      registerMenuItem.classList.remove('hidden');
      logoutMenuItem.classList.add('hidden');

      if (favoritesMenuItem) favoritesMenuItem.classList.add('hidden');
      if (addStoryMenuItem) addStoryMenuItem.classList.add('hidden');
      if (mapMenuItem) mapMenuItem.classList.add('hidden');
      if (notificationsMenuItem) notificationsMenuItem.classList.add('hidden');
    }

    logoutMenuItem.addEventListener('click', (event) => {
      event.preventDefault();
      this._handleLogout();
    });
  }

  async _subscribeToPushNotification() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const permission = await NotificationHelper.requestPermission();

        if (permission && registration) {
          await NotificationHelper.subscribePushNotification(registration);
        }
      }
    } catch (error) {
      console.error('Error subscribing to push notification:', error);
    }
  }

  async _handleLogout() {
    this._cleanupCurrentPage();

    AuthHelper.logout();

    try {
      await IdbHelper.clearStories();
      console.log('Stories cleared from IndexedDB after logout');
    } catch (error) {
      console.error('Error clearing stories from IndexedDB:', error);
    }

    window.location.href = '#/';
    window.location.reload();
  }

  _cleanupCurrentPage() {
    if (this._currentPage && typeof this._currentPage.beforeUnload === 'function') {
      console.log('Cleaning up current page...');
      this._currentPage.beforeUnload();
      this._currentPage = null;
    }
  }

  async _handleRoute() {
    console.log('Handling route...');
    console.log('Current hash:', window.location.hash);

    this._cleanupCurrentPage();

    const urlParts = window.location.hash.slice(1).split('/');
    if (urlParts.length > 2 && urlParts[1] === 'detail') {
      window.selectedStoryId = urlParts[2];
      window.history.replaceState(null, null, '#/detail');
    }

    const url = UrlParser.parseActiveUrlWithCombiner();
    console.log('Parsed URL:', url);
    console.log('Available routes:', Object.keys(routes));
    console.log('Current URL:', url);
    let page;

    if (routes[url]) {
      page = routes[url];
    } else {
      console.log('Route not found, redirecting to 404 page');
      page = routes['/404'];
    }

    console.log('Page to render:', page);

    try {
      if (url === '/login' || url === '/register') {
        if (AuthHelper.isLoggedIn()) {
          console.log('User is logged in, redirecting to home');
          window.location.href = '#/';
          return;
        }
      }

      if ((url === '/add' || url === '/map' || url === '/favorites' || url === '/notifications') && !AuthHelper.isLoggedIn()) {
        console.log('Protected route, redirecting to login');
        window.location.href = '#/login';
        return;
      }

      const contentContainer = document.querySelector('#content');

      if (!contentContainer) {
        console.error('Content container not found');
        return;
      }

      contentContainer.innerHTML = '';

      this._currentPage = new page.view();
      console.log('View instantiated');
      const content = await this._currentPage.render();
      console.log('Content rendered');
      contentContainer.innerHTML = content;
      console.log('Content injected into DOM');
      await this._currentPage.afterRender();
      console.log('afterRender completed');

      document.getElementById('main-content').focus();

    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  window.app = new App();
  console.log('App initialized:', window.app);
  console.log('Routes available:', Object.keys(routes));
});
