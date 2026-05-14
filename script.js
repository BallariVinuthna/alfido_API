/**
 * NEXUS | Futuristic GitHub Explorer
 * Core Logic Engine
 */

class NexusApp {
    constructor() {
        this.apiBase = 'https://api.github.com/users';
        this.searchHistory = [];
        this.currentData = {
            user: null,
            repos: []
        };

        // DOM Elements
        this.searchBox = document.getElementById('github-search');
        this.searchBtn = document.getElementById('search-btn');
        this.dataDisplay = document.getElementById('data-display');
        this.profileCard = document.getElementById('profile-card');
        this.themeToggle = document.getElementById('theme-toggle');
        this.scrollProgress = document.getElementById('scroll-progress');
        this.backToTop = document.getElementById('back-to-top');
        this.filterPills = document.querySelectorAll('.filter-pill');

        this.init();
    }

    init() {
        this.attachEventListeners();
        this.setupTheme();
        this.handleScroll();
    }

    attachEventListeners() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        this.backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        this.filterPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                this.filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.filterData(pill.dataset.filter);
            });
        });

        window.addEventListener('scroll', () => this.handleScroll());
    }

    // --- Core Logic ---

    async handleSearch() {
        const username = this.searchBox.value.trim();
        if (!username) return;

        this.showLoading();
        this.hideError();

        try {
            const userResponse = await fetch(`${this.apiBase}/${username}`);
            if (!userResponse.ok) throw new Error('User not found');
            
            const userData = await userResponse.json();
            
            const reposResponse = await fetch(`${this.apiBase}/${username}/repos?sort=updated&per_page=12`);
            const reposData = await reposResponse.json();

            this.currentData = { user: userData, repos: reposData };
            this.renderUI();
        } catch (error) {
            console.error(error);
            this.showError(error.message);
        }
    }

    renderUI() {
        this.renderProfile(this.currentData.user);
        this.renderRepos(this.currentData.repos);
    }

    renderProfile(user) {
        this.profileCard.classList.remove('hidden');
        this.profileCard.innerHTML = `
            <div class="profile-avatar">
                <img src="${user.avatar_url}" alt="${user.login}">
            </div>
            <h3>${user.name || user.login}</h3>
            <p class="text-muted">@${user.login}</p>
            <p class="bio mt-3">${user.bio || 'No bio available for this intelligence unit.'}</p>
            
            <div class="profile-stats">
                <div class="stat-item">
                    <span>${user.public_repos}</span>
                    <label>Repos</label>
                </div>
                <div class="stat-item">
                    <span>${user.followers}</span>
                    <label>Followers</label>
                </div>
                <div class="stat-item">
                    <span>${user.following}</span>
                    <label>Following</label>
                </div>
            </div>

            <div class="d-grid gap-2">
                <a href="${user.html_url}" target="_blank" class="primary-btn justify-content-center">
                    Visit Profile <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;
    }

    renderRepos(repos) {
        this.dataDisplay.innerHTML = '';
        if (repos.length === 0) {
            this.dataDisplay.innerHTML = '<div class="text-center p-5"><h3>No public repositories found.</h3></div>';
            return;
        }

        repos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'glass-card repo-card fade-up-title';
            card.innerHTML = `
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <i class="fas fa-code-branch text-info"></i>
                    <span class="repo-lang">${repo.language || 'Plain Text'}</span>
                </div>
                <h4>${repo.name}</h4>
                <p class="text-muted flex-grow-1">${repo.description || 'No description provided for this codebase.'}</p>
                <div class="repo-meta d-flex justify-content-between mt-3 align-items-center">
                    <div>
                        <span class="me-3"><i class="far fa-star"></i> ${repo.stargazers_count}</span>
                        <span><i class="far fa-eye"></i> ${repo.watchers_count}</span>
                    </div>
                    <button class="glass-btn btn-sm" onclick="app.showRepoDetails('${repo.name}')">Details</button>
                </div>
            `;
            this.dataDisplay.appendChild(card);
        });
    }

    async showRepoDetails(repoName) {
        const username = this.currentData.user.login;
        const modalBody = document.getElementById('modal-content');
        modalBody.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-info"></div></div>';
        
        const myModal = new bootstrap.Modal(document.getElementById('repoModal'));
        myModal.show();

        try {
            const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
            const repo = await response.json();
            
            modalBody.innerHTML = `
                <div class="repo-detail-header mb-4">
                    <h2 class="gradient-text">${repo.name}</h2>
                    <p class="text-muted">${repo.full_name}</p>
                </div>
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="glass-card h-100 p-3">
                            <h6>Intelligence Data</h6>
                            <ul class="list-unstyled mt-3">
                                <li><strong>Default Branch:</strong> ${repo.default_branch}</li>
                                <li><strong>License:</strong> ${repo.license ? repo.license.name : 'N/A'}</li>
                                <li><strong>Created:</strong> ${new Date(repo.created_at).toLocaleDateString()}</li>
                                <li><strong>Last Updated:</strong> ${new Date(repo.updated_at).toLocaleDateString()}</li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="glass-card h-100 p-3">
                            <h6>Metrics</h6>
                            <div class="d-flex justify-content-between mt-3">
                                <span><i class="fas fa-star text-warning"></i> Stars:</span>
                                <span>${repo.stargazers_count}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span><i class="fas fa-code-fork text-primary"></i> Forks:</span>
                                <span>${repo.forks_count}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span><i class="fas fa-exclamation-circle text-danger"></i> Issues:</span>
                                <span>${repo.open_issues_count}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-4 text-center">
                    <a href="${repo.html_url}" target="_blank" class="primary-btn">Open in GitHub <i class="fab fa-github"></i></a>
                </div>
            `;
        } catch (error) {
            modalBody.innerHTML = `<div class="alert alert-danger">Error fetching repo details: ${error.message}</div>`;
        }
    }

    // --- UI Utilities ---

    showLoading() {
        this.dataDisplay.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const skeleton = document.getElementById('skeleton-loader').content.cloneNode(true);
            this.dataDisplay.appendChild(skeleton);
        }
    }

    showError(msg) {
        const errorContainer = document.getElementById('error-container');
        document.getElementById('error-msg').textContent = msg;
        errorContainer.classList.remove('hidden');
        this.dataDisplay.innerHTML = '';
        this.profileCard.classList.add('hidden');
    }

    hideError() {
        document.getElementById('error-container').classList.add('hidden');
    }

    filterData(filter) {
        if (!this.currentData.repos.length) return;

        let filtered = [...this.currentData.repos];
        if (filter === 'followers') {
            // In a real app, we might fetch followers, but here we just sort repos by stars as a proxy or show a message
            filtered = filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
        }
        
        this.renderRepos(filtered);
    }

    handleScroll() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        this.scrollProgress.style.width = scrolled + "%";

        if (winScroll > 300) {
            this.backToTop.classList.add('visible');
            this.backToTop.style.display = 'block';
        } else {
            this.backToTop.classList.remove('visible');
            this.backToTop.style.display = 'none';
        }
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('nexus-theme') || 'dark';
        document.body.className = savedTheme + '-theme';
        this.updateThemeIcon();
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.className = newTheme + '-theme';
        localStorage.setItem('nexus-theme', newTheme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const icon = this.themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

// Initialize Application
const app = new NexusApp();
window.app = app; // For onclick accessibility
