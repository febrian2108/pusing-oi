import { StoryConfig } from '../../config/api-config.js';
import { HomePresenter } from '../../presenters/home-presenter.js';
import { AuthHelper } from '../../utils/auth-helper.js';
import { IdbHelper } from '../../utils/indexed-db.js';

class HomePage {
  constructor() {
    this._config = new StoryConfig();
    this._presenter = null;
    this._showFavorites = false;
    this._title = 'StoryApps';
  }

  async render() {
    document.title = this._title;

    return `
      <section class="home-page page-transition">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">Bagikan Ceritamu</h1>
              <p class="hero-description">
              Bergabunglah dengan komunitas Dicoding dan bagikan pengalaman menarik 
              Anda. Temukan inspirasi dari cerita-cerita luar biasa dari seluruh Indonesia.
              </p>
              <br>
              <div class="hero-actions">
              <a href="#/add" class="btn btn-primary hero-btn">
              <i class="fas fa-plus"></i>
              <span>Tambah Cerita</span>
              </a>
              <a href="#/map" class="btn btn-secondary hero-btn">
              <i class="fas fa-map-marked-alt"></i>
              <span>Jelajahi Peta</span>
              </a>
              </div>
              </div>
              </div>
              </div>
              <br>

        <div class="coordinator-layout">
          <div class="coordinator-header">
            <div>
              <h2 class="coordinator-title">Cerita Terbaru</h2>
              <p>Jelajahi dan bagikan cerita menarik dari komunitas Dicoding</p>
            </div>
            <br>
            <button id="toggle-favorites" class="btn btn-outline">
              <i class="fas fa-heart"></i>
              <span>Cerita Favorit</span>
            </button>
          </div>
          <br>
          <div id="stories-container" class="coordinator-grid">
            <div class="loader" id="stories-loader"></div>
          </div>
          <div id="error-container" class="error-container hidden"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._presenter = new HomePresenter(this._config, this);

    const toggleFavoritesButton = document.getElementById('toggle-favorites');
    if (toggleFavoritesButton) {
      toggleFavoritesButton.addEventListener('click', () => {
        this._showFavorites = !this._showFavorites;
        this._refreshContent();
      });
    }

    await this._presenter.getStories();
  }

  async _refreshContent() {
    const toggleFavoritesButton = document.getElementById('toggle-favorites');
    const titleElement = document.querySelector('.coordinator-title');

    if (this._showFavorites) {
      try {
        this.showLoading();
        const favorites = await IdbHelper.getFavorites();
        this.renderStories(favorites);

        if (toggleFavoritesButton) {
          toggleFavoritesButton.innerHTML = '<i class="fas fa-list"></i> Semua Cerita';
        }
        if (titleElement) {
          titleElement.textContent = 'Cerita Favorit';
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        this.showError('Gagal memuat cerita favorit');
      }
    } else {
      if (toggleFavoritesButton) {
        toggleFavoritesButton.innerHTML = '<i class="fas fa-bookmark"></i> Cerita Favorit';
      }
      if (titleElement) {
        titleElement.textContent = 'Cerita Terbaru';
      }

      await this._presenter.getStories();
    }
  }

  showLoading() {
    const loader = document.getElementById('stories-loader');
    if (loader) loader.classList.remove('hidden');

    const errorContainer = document.getElementById('error-container');
    if (errorContainer) errorContainer.classList.add('hidden');

    const storiesContainer = document.getElementById('stories-container');
    if (storiesContainer) {
      [...storiesContainer.children].forEach(child => {
        if (child.id !== 'stories-loader') child.remove();
      });
    }
  }

  hideLoading() {
    const loader = document.getElementById('stories-loader');
    if (loader) loader.classList.add('hidden');
  }

  async renderStories(stories) {
    this.hideLoading();
    const storiesContainer = document.getElementById('stories-container');
    if (!storiesContainer) return;

    if (stories.length === 0) {
      storiesContainer.innerHTML = `
        <div class="empty-state">
          <p>${this._showFavorites ? 'Belum ada cerita favorit.' : 'Belum ada cerita yang dibagikan.'}</p>
        </div>
      `;
      return;
    }

    storiesContainer.innerHTML = '';

    for (const story of stories) {
      const initial = story.name ? story.name.charAt(0).toUpperCase() : '?';
      const isFavorite = await IdbHelper.isFavorite(story.id);

      const storyItemElement = document.createElement('article');
      storyItemElement.classList.add('story-card');
      storyItemElement.innerHTML = `
        <div class="story-image-container">
          <img
            src="${story.photoUrl}"
            alt="Cerita dari ${story.name}"
            class="story-image"
            loading="lazy"
            onerror="this.src='./src/public/fallback.jpg';"
          />
        </div>
        <div class="story-content">
          <div class="user-info">
            <div class="user-avatar">${initial}</div>
            <span class="user-name">${story.name}</span>
          </div>
          <h3 class="story-title">${story.name}</h3>
          <p class="story-description">${this._truncateText(story.description, 100)}</p>
          <div class="story-meta">
            <div class="story-info">
              <i class="fas fa-calendar-alt"></i>
              <span>${this._formatDate(story.createdAt)}</span>
            </div>
            ${story.lat && story.lon ? `
              <div class="story-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>Lokasi tersedia</span>
              </div>` : ''}
          </div>
          <div class="story-actions">
            <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" 
                    data-id="${story.id}"
                    data-tooltip="${isFavorite ? 'Klik untuk menghapus dari favorit' : 'Klik untuk menyimpan cerita'}"
                    data-label="${isFavorite ? 'Tersimpan' : 'Simpan'}">
              <i class="fa-${isFavorite ? 'solid' : 'regular'} fa-bookmark"></i>
            </button>
            <a href="#" class="view-details-btn" data-id="${story.id}">
              View Details
            </a>
          </div>
        </div>
      `;

      storiesContainer.appendChild(storyItemElement);

      storyItemElement.querySelector('.view-details-btn').addEventListener('click', (e) => {
        e.preventDefault();
        window.selectedStoryId = story.id;
        window.location.href = '#/detail';
      });

      storyItemElement.querySelector('.favorite-btn').addEventListener('click', async (e) => {
        e.preventDefault();

        const favoriteBtn = e.currentTarget;
        const icon = favoriteBtn.querySelector('i');

        // Add loading state
        favoriteBtn.classList.add('loading');
        favoriteBtn.disabled = true;

        try {
          const isFav = await IdbHelper.isFavorite(story.id);

          if (isFav) {
            await IdbHelper.removeFromFavorites(story.id);
            favoriteBtn.classList.remove('favorited');
            icon.classList.replace('fa-solid', 'fa-regular');
            favoriteBtn.setAttribute('data-tooltip', 'Klik untuk menyimpan cerita');
          } else {
            await IdbHelper.addToFavorites(story);
            favoriteBtn.classList.add('favorited', 'success');
            icon.classList.replace('fa-regular', 'fa-solid');
            favoriteBtn.setAttribute('data-tooltip', 'Klik untuk menghapus dari favorit');

            // Remove success class after animation
            setTimeout(() => {
              favoriteBtn.classList.remove('success');
            }, 600);
          }

          if (this._showFavorites) {
            this._refreshContent();
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
          // Show error feedback
          favoriteBtn.style.background = '#ef4444';
          setTimeout(() => {
            favoriteBtn.style.background = '';
          }, 1000);
        } finally {
          // Remove loading state
          favoriteBtn.classList.remove('loading');
          favoriteBtn.disabled = false;
        }
      });
    }
  }

  showError(message) {
    this.hideLoading();

    const errorContainer = document.getElementById('error-container');
    if (!errorContainer) return;

    errorContainer.classList.remove('hidden');
    errorContainer.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-triangle fa-3x"></i>
        <h3>Gagal memuat cerita</h3>
        <p>${message}</p>
        <button id="retry-button" class="btn">Coba Lagi</button>
      </div>
    `;

    document.getElementById('retry-button').addEventListener('click', async () => {
      await this._presenter.getStories();
    });
  }

  _truncateText(text, maxLength) {
    return text.length <= maxLength ? text : `${text.substr(0, maxLength)}...`;
  }

  _formatDate(dateString) {
    const options = {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }
}

export { HomePage };
