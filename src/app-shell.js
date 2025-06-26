import { AuthHelper } from './utils/auth-helper';
import { NetworkStatus } from './utils/network-status';

class AppShell {
  static init() {
    NetworkStatus.init();
    this._renderAppShell();
    this._setupEventListeners();
    this._updateNavbarVisibility();
    this._setupNetworkStatusListener();
  }

  static _renderAppShell() {
    document.body.innerHTML = `
      <a href="#main-content" class="skip-link">Langsung ke konten</a>

      <header>
        <div class="header-container">
          <div class="brand">
            <h1><a href="#/">StoryApps</a></h1>
          </div>
          <nav id="drawer" class="nav">
            <ul class="nav-list">
              <li class="nav-item"><a href="#/"><i class="fas fa-home"></i> Beranda</a></li>
              <li class="nav-item"><a href="#/add"><i class="fas fa-plus-circle"></i> Tambah Cerita</a></li>
              <li class="nav-item"><a href="#/map"><i class="fas fa-map-marked-alt"></i> Peta Cerita</a></li>
              <li class="nav-item"><a href="#/favorites"><i class="fas fa-bookmark"></i> Favorit</a></li>
              <li class="nav-item"><a href="#/notification-settings"><i class="fas fa-bell"></i> Notifikasi</a></li>
              <li class="nav-item" id="login-menu"><a href="#/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
              <li class="nav-item" id="register-menu"><a href="#/register"><i class="fas fa-user-plus"></i> Register</a></li>
              <li class="nav-item" id="logout-menu"><a href="#/"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
          </nav>
          <button id="menu" class="header-menu" aria-label="Toggle navigation menu">☰</button>
        </div>
      </header>

      <main id="main-content" tabindex="-1">
        <div id="offline-notification" class="offline-notification" style="display: none;">
          Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
        </div>
        <div id="content" class="content"></div>
      </main>

      <footer>
        <div class="footer-content">
          <p>&copy; 2025 StoryApps - Berbagi Cerita Dicoding</p>
        </div>
      </footer>
    `;
  }

  static _setupEventListeners() {
    const hamburgerButton = document.getElementById("menu");
    const navList = document.querySelector(".nav-list");

    hamburgerButton.addEventListener("click", (event) => {
      navList.classList.toggle("show");
      hamburgerButton.setAttribute("aria-expanded", navList.classList.contains("show"));
      event.stopPropagation();
    });

    document.addEventListener("click", (event) => {
      if (navList.classList.contains("show") && !navList.contains(event.target) && event.target !== hamburgerButton) {
        navList.classList.remove("show");
        hamburgerButton.setAttribute("aria-expanded", "false");
      }
    });

    navList.addEventListener("click", (event) => {
      if (event.target.tagName === "A") {
        navList.classList.remove("show");
        hamburgerButton.setAttribute("aria-expanded", "false");
      }
    });

    const logoutButton = document.getElementById("logout-menu");
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        AuthHelper.logout();
        this._updateNavbarVisibility();
        window.location.hash = "#/";
      });
    }
  }

  static _updateNavbarVisibility() {
    const isLoggedIn = AuthHelper.isLoggedIn();
    const loginMenu = document.getElementById("login-menu");
    const registerMenu = document.getElementById("register-menu");
    const logoutMenu = document.getElementById("logout-menu");
    if (!loginMenu || !registerMenu || !logoutMenu) return;
    if (isLoggedIn) {
      loginMenu.classList.add('hidden');
      registerMenu.classList.add('hidden');
      logoutMenu.classList.remove('hidden');
    } else {
      loginMenu.classList.remove('hidden');
      registerMenu.classList.remove('hidden');
      logoutMenu.classList.add('hidden');
    }
  }

  static _setupNetworkStatusListener() {
    const offlineNotification = document.getElementById("offline-notification");
    NetworkStatus.onOnline(() => {
      offlineNotification.style.display = "none";
    });
    NetworkStatus.onOffline(() => {
      offlineNotification.style.display = "block";
    });
    // Initial check
    if (!navigator.onLine) {
      offlineNotification.style.display = "block";
    } else {
      offlineNotification.style.display = "none";
    }
  }
}

export { AppShell };


