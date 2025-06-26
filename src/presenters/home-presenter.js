class HomePresenter {
    constructor(config, view) {
        this._config = config;
        this._view = view;
    }

    async getStories() {
        try {
            this._view.showLoading();
            const stories = await this._config.getStories(1, 10, 1);
            this._view.renderStories(stories);
        } catch (error) {
            console.error('Home presenter error:', error);
            this._view.showError(error.message);
        }
    }
}

export { HomePresenter };