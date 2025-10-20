// --- IMPORTANTE ---
// Cole sua Chave da API (do Passo 1) aqui dentro das aspas
const API_KEY = 'AIzaSyDKaO-EfINSsZ54X2QqVlWX81_9rgw8EJQ';

// Elementos da página
const videoContainer = document.getElementById('video-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Estado da aplicação
let currentVideoId = null;
let videoHistory = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let playlists = JSON.parse(localStorage.getItem('playlists')) || {}; // { nome: [{ id, title, channelTitle }] }

// Sistema de Temas
function loadTheme() {
    const savedMode = localStorage.getItem('themeMode') || 'light';
    const savedColor = localStorage.getItem('themeColor') || 'green';
    const themeClass = `${savedMode}-${savedColor}`;
    document.body.setAttribute('data-theme', themeClass);
}

function openSettings() {
    window.location.href = 'settings.html';
}

function openPlaylists() {
    window.location.href = 'playlists.html';
}

// URLS da API do YouTube
const popularVideosURL = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=BR&maxResults=20&key=${API_KEY}`;
const searchVideosURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&key=${API_KEY}&q=`;

// Função para mostrar estado de carregamento
function showLoading() {
    videoContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Carregando vídeos...
        </div>
    `;
}

// Função para mostrar erro
function showError(message) {
    videoContainer.innerHTML = `
        <div class="error-message">
            ❌ ${message}
        </div>
    `;
}

// Evento para o botão de busca
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        showLoading();
        fetchVideos(searchVideosURL + encodeURIComponent(query));
    }
});

// Evento para buscar ao pressionar "Enter"
searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

// Função principal para buscar vídeos
async function fetchVideos(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            showError(`Erro da API: ${data.error.message}`);
            return;
        }
        
        // Exibe os novos vídeos
        displayVideos(data.items);
    } catch (error) {
        console.error("Erro ao buscar vídeos:", error);
        showError("Erro ao carregar vídeos. Verifique sua conexão e chave de API.");
    }
}

// Função para mostrar os vídeos na tela
function displayVideos(videos) {
    if (videos.length === 0) {
        videoContainer.innerHTML = `
            <div class="error-message">
                🔍 Nenhum vídeo encontrado. Tente uma busca diferente!
            </div>
        `;
        return;
    }

    videoContainer.innerHTML = '';

    videos.forEach(video => {
        const videoId = video.id.videoId || video.id;
        const snippet = video.snippet;
        const statistics = video.statistics || {};
        
        const thumbnailUrl = snippet.thumbnails.medium.url;
        const title = snippet.title;
        const channelTitle = snippet.channelTitle;
        const publishedAt = new Date(snippet.publishedAt).toLocaleDateString('pt-BR');
        const viewCount = statistics.viewCount ? formatViewCount(statistics.viewCount) : 'N/A';
        
        const isFavorite = favorites.includes(videoId);

        // Cria o card do vídeo
        const videoElement = document.createElement('div');
        videoElement.className = 'video-item';
        videoElement.innerHTML = `
            <img src="${thumbnailUrl}" alt="${title}" loading="lazy">
            <div class="video-info">
            <h3>${title}</h3>
                <div class="video-meta">
                    <span class="channel-name">${channelTitle}</span>
                    <span class="view-count">${viewCount} visualizações</span>
                </div>
                <div class="video-meta">
                    <span>📅 ${publishedAt}</span>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-video-id="${videoId}" title="Favoritar">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                        <button class="add-playlist-btn" title="Adicionar à playlist">➕</button>
                    </div>
                </div>
            </div>
        `;
        
        // Adiciona eventos
        videoElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('favorite-btn')) {
                playVideo(videoId, snippet);
            }
        });

        // Evento para favoritar
        const favoriteBtn = videoElement.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(videoId, favoriteBtn);
        });

        const addPlaylistBtn = videoElement.querySelector('.add-playlist-btn');
        addPlaylistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.__lastVideoToAdd = { id: videoId, title, channelTitle };
            promptAddToPlaylist({ id: videoId, title, channelTitle });
        });

        videoContainer.appendChild(videoElement);
    });
}

// Função para tocar um vídeo
function playVideo(videoId, snippet) {
    currentVideoId = videoId;
    
    // Adiciona ao histórico
    if (!videoHistory.includes(videoId)) {
        videoHistory.unshift(videoId);
        if (videoHistory.length > 10) {
            videoHistory.pop();
        }
    }
    
    const title = snippet ? snippet.title : 'Vídeo';
    const channelTitle = snippet ? snippet.channelTitle : 'Canal';
    
    // Limpa a tela e mostra apenas o player
    videoContainer.innerHTML = `
        <div class="video-player">
            <div class="player-controls">
                <button class="control-btn" onclick="goBack()" title="Voltar">←</button>
                <button class="control-btn" onclick="toggleFavorite('${videoId}', null)" title="Favoritar">
                    ${favorites.includes(videoId) ? '❤️' : '🤍'}
                </button>
                <button class="control-btn" onclick="shareVideo('${videoId}', '${title}')" title="Compartilhar">📤</button>
                <button class="control-btn" onclick="(function(){window.__lastVideoToAdd={ id: '${videoId}', title: '${title.replace(/'/g, "\'")}', channelTitle: '${channelTitle.replace(/'/g, "\'")}' }; promptAddToPlaylist(window.__lastVideoToAdd);})()" title="Adicionar à playlist">➕</button>
            </div>
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
            <div style="padding: 20px; background: rgba(255,255,255,0.95); margin-top: 10px; border-radius: 15px;">
                <h2 style="margin-bottom: 10px; color: #333;">${title}</h2>
                <p style="color: #666; margin-bottom: 15px;">📺 ${channelTitle}</p>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button onclick="goBack()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 25px; cursor: pointer;">
                        ← Voltar aos vídeos
                    </button>
                    <button onclick="showFavorites()" style="padding: 10px 20px; background: #ff6b6b; color: white; border: none; border-radius: 25px; cursor: pointer;">
                        ❤️ Meus Favoritos
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Rola a tela para o topo para ver o vídeo
    window.scrollTo(0, 0);

    // Se houver uma fila salva, configura navegação automática
    const queue = JSON.parse(localStorage.getItem('currentQueue') || '[]');
    if (queue.length > 0) {
        const currentIndex = queue.indexOf(videoId);
        if (currentIndex > -1) {
            const controls = document.querySelector('.player-controls');
            if (controls) {
                // Botão Anterior
                if (currentIndex > 0) {
                    const prevBtn = document.createElement('button');
                    prevBtn.className = 'control-btn';
                    prevBtn.title = 'Anterior da playlist';
                    prevBtn.textContent = '⏮️';
                    prevBtn.onclick = function() {
                        const prevId = queue[currentIndex - 1];
                        playVideo(prevId, snippet);
                    };
                    controls.appendChild(prevBtn);
                }
                
                // Botão Próximo
                if (currentIndex < queue.length - 1) {
                    const nextBtn = document.createElement('button');
                    nextBtn.className = 'control-btn';
                    nextBtn.title = 'Próximo da playlist';
                    nextBtn.textContent = '⏭️';
                    nextBtn.onclick = function() {
                        const nextId = queue[currentIndex + 1];
                        // Limpa fila ao finalizar
                        if (currentIndex + 1 >= queue.length - 1) {
                            localStorage.removeItem('currentQueue');
                        }
                        playVideo(nextId, snippet);
                    };
                    controls.appendChild(nextBtn);
                } else if (currentIndex === queue.length - 1) {
                    // último item, limpar fila
                    localStorage.removeItem('currentQueue');
                }
            }
        }
    }
}


// Funções auxiliares
function formatViewCount(count) {
    const num = parseInt(count);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function toggleFavorite(videoId, button) {
    const index = favorites.indexOf(videoId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.unshift(videoId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    if (button) {
        button.textContent = favorites.includes(videoId) ? '❤️' : '🤍';
        button.classList.toggle('favorited', favorites.includes(videoId));
    }
}

function goBack() {
    showLoading();
    fetchVideos(popularVideosURL);
}

function showFavorites() {
    if (favorites.length === 0) {
        videoContainer.innerHTML = `
            <div class="error-message">
                ❤️ Você ainda não tem vídeos favoritos!
            </div>
        `;
        return;
    }
    
    showLoading();
    
    // Busca informações dos vídeos favoritos
    const videoIds = favorites.join(',');
    const favoritesURL = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;
    
    fetch(favoritesURL)
        .then(response => response.json())
        .then(data => {
            if (data.items) {
                displayVideos(data.items);
            } else {
                showError('Erro ao carregar favoritos');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar favoritos:', error);
            showError('Erro ao carregar favoritos');
        });
}

function shareVideo(videoId, title) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        });
    } else {
        // Fallback para copiar para clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copiado para a área de transferência!');
        });
    }
}

// -------------------- Playlists --------------------
function promptAddToPlaylist(video) {
    // Abre modal com listas existentes e opção de criar
    const overlay = document.getElementById('playlist-modal');
    const listEl = document.getElementById('playlist-list');
    const inputNew = document.getElementById('new-playlist-name');

    // Renderiza playlists existentes
    const names = Object.keys(playlists);
    listEl.innerHTML = '';
    if (names.length === 0) {
        listEl.innerHTML = '<div class="error-message" style="margin:0">Nenhuma playlist criada ainda.</div>';
    } else {
        names.forEach(name => {
            const row = document.createElement('div');
            row.className = 'playlist-item';
            row.innerHTML = `
                <span style="color: var(--text-primary);">${name}</span>
                <button>Adicionar</button>
            `;
            row.querySelector('button').onclick = () => {
                addVideoToPlaylistByName(name, video);
                closePlaylistModal();
            };
            listEl.appendChild(row);
        });
    }

    inputNew.value = '';
    overlay.style.display = 'flex';
}

function removeFromPlaylist(playlistName, index) {
    if (!playlists[playlistName]) return;
    playlists[playlistName].splice(index, 1);
    localStorage.setItem('playlists', JSON.stringify(playlists));
}

function getPlaylists() {
    return JSON.parse(localStorage.getItem('playlists')) || {};
}

function addVideoToPlaylistByName(name, video) {
    if (!playlists[name]) playlists[name] = [];
    const last = playlists[name][playlists[name].length - 1];
    if (!last || last.id !== video.id) {
        playlists[name].push({ id: video.id, title: video.title, channelTitle: video.channelTitle });
    }
    localStorage.setItem('playlists', JSON.stringify(playlists));
}

function closePlaylistModal() {
    const overlay = document.getElementById('playlist-modal');
    if (overlay) overlay.style.display = 'none';
}

function createNewPlaylistFromModal() {
    const input = document.getElementById('new-playlist-name');
    const name = (input.value || '').trim();
    if (!name) return;
    if (!playlists[name]) playlists[name] = [];
    localStorage.setItem('playlists', JSON.stringify(playlists));
    // Re-renderiza a lista e adiciona já o vídeo atual se vier de um card
    const tempVideo = window.__lastVideoToAdd;
    if (tempVideo) {
        addVideoToPlaylistByName(name, tempVideo);
    }
    // Atualiza UI
    input.value = '';
    // Reabrir promptAddToPlaylist se houver vídeo
    if (tempVideo) {
        promptAddToPlaylist(tempVideo);
    }
}

// --- Início ---
// Carrega o tema e os vídeos mais populares do Brasil ao abrir a página
loadTheme();

// Se veio de playlists com fila, inicia no primeiro vídeo
const pendingQueue = JSON.parse(localStorage.getItem('currentQueue') || '[]');
if (pendingQueue.length > 0) {
    // Busca infos do primeiro vídeo e toca
    const firstId = pendingQueue[0];
    fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${firstId}&key=${API_KEY}`)
        .then(r => r.json())
        .then(d => {
            if (d.items && d.items[0]) {
                playVideo(firstId, d.items[0].snippet);
            } else {
                showLoading();
                fetchVideos(popularVideosURL);
            }
        })
        .catch(() => {
            showLoading();
            fetchVideos(popularVideosURL);
        });
} else {
    showLoading();
fetchVideos(popularVideosURL);
}