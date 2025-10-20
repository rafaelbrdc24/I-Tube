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
                        <button class="popup-btn-small" onclick="openPopupPlayer('${videoId}', '${title.replace(/'/g, "\\'")}', '${channelTitle.replace(/'/g, "\\'")}')" title="Abrir em popup">📱</button>
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
                <button class="control-btn" onclick="openPopupPlayer('${videoId}', '${title.replace(/'/g, "\\'")}', '${channelTitle.replace(/'/g, "\\'")}')" title="Abrir em popup">📱</button>
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
            <div style="padding: 20px; background: var(--card-background); margin-top: 10px; border-radius: 15px;">
                <h2 style="margin-bottom: 10px; color: var(--text-primary);">${title}</h2>
                <p style="color: var(--text-secondary); margin-bottom: 15px;">📺 ${channelTitle}</p>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button onclick="goBack()" style="padding: 10px 20px; background: var(--accent-color); color: white; border: none; border-radius: 25px; cursor: pointer;">
                        ← Voltar aos vídeos
                    </button>
                    <button onclick="openPopupPlayer('${videoId}', '${title.replace(/'/g, "\\'")}', '${channelTitle.replace(/'/g, "\\'")}')" style="padding: 10px 20px; background: #4caf50; color: white; border: none; border-radius: 25px; cursor: pointer;">
                        📱 Assistir em popup
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

// --- Sistema de Popup Player ---
let popupPlayer = null;
let currentPopupVideo = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// Inicializa o popup player
function initPopupPlayer() {
    popupPlayer = document.getElementById('popup-player');
    if (!popupPlayer) return;

    // Adiciona event listeners para drag
    const header = popupPlayer.querySelector('.popup-header');
    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Adiciona event listener para redimensionamento
    const resizeHandle = popupPlayer.querySelector('.popup-resize-handle');
    if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', startResize);
    }
}

// Abre o popup player com um vídeo
function openPopupPlayer(videoId, title, channelTitle) {
    if (!popupPlayer) initPopupPlayer();
    
    currentPopupVideo = { id: videoId, title, channelTitle };
    
    // Atualiza o conteúdo do popup
    document.getElementById('popup-video-title').textContent = title;
    document.getElementById('popup-iframe').src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    
    // Atualiza o botão de favorito
    updatePopupFavoriteButton();
    
    // Mostra o popup
    popupPlayer.style.display = 'flex';
    popupPlayer.classList.add('show');
    
    // Remove a classe de animação após a animação
    setTimeout(() => {
        popupPlayer.classList.remove('show');
    }, 300);
}

// Fecha o popup player
function closePopup() {
    if (popupPlayer) {
        popupPlayer.style.display = 'none';
        document.getElementById('popup-iframe').src = '';
        currentPopupVideo = null;
    }
}

// Minimiza o popup
function minimizePopup() {
    if (popupPlayer) {
        popupPlayer.classList.toggle('minimized');
    }
}

// Maximiza o popup
function maximizePopup() {
    if (popupPlayer) {
        popupPlayer.classList.toggle('maximized');
    }
}

// Atualiza o botão de favorito no popup
function updatePopupFavoriteButton() {
    if (!currentPopupVideo) return;
    
    const favoriteBtn = document.getElementById('popup-favorite-btn');
    const favoriteIcon = document.getElementById('popup-favorite-icon');
    
    if (favorites.includes(currentPopupVideo.id)) {
        favoriteIcon.textContent = '❤️';
        favoriteBtn.style.background = '#ff6b6b';
    } else {
        favoriteIcon.textContent = '🤍';
        favoriteBtn.style.background = 'var(--accent-color)';
    }
}

// Toggle favorito no popup
function toggleFavoritePopup() {
    if (!currentPopupVideo) return;
    
    toggleFavorite(currentPopupVideo.id, null);
    updatePopupFavoriteButton();
}

// Compartilhar vídeo do popup
function shareVideoPopup() {
    if (!currentPopupVideo) return;
    shareVideo(currentPopupVideo.id, currentPopupVideo.title);
}

// Adicionar à playlist do popup
function addToPlaylistPopup() {
    if (!currentPopupVideo) return;
    window.__lastVideoToAdd = currentPopupVideo;
    promptAddToPlaylist(currentPopupVideo);
}

// Sistema de drag para mover o popup
function startDrag(e) {
    isDragging = true;
    const rect = popupPlayer.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    popupPlayer.style.cursor = 'grabbing';
}

function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    
    // Limita a posição dentro da viewport
    const maxX = window.innerWidth - popupPlayer.offsetWidth;
    const maxY = window.innerHeight - popupPlayer.offsetHeight;
    
    popupPlayer.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    popupPlayer.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    popupPlayer.style.right = 'auto';
    popupPlayer.style.bottom = 'auto';
}

function endDrag() {
    isDragging = false;
    if (popupPlayer) {
        popupPlayer.style.cursor = 'move';
    }
}

// Sistema de redimensionamento
let isResizing = false;

function startResize(e) {
    isResizing = true;
    e.preventDefault();
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', endResize);
}

function resize(e) {
    if (!isResizing) return;
    
    const rect = popupPlayer.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    const newHeight = e.clientY - rect.top;
    
    // Aplica limites mínimos e máximos
    const minWidth = 300;
    const minHeight = 200;
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.8;
    
    popupPlayer.style.width = Math.max(minWidth, Math.min(newWidth, maxWidth)) + 'px';
    popupPlayer.style.height = Math.max(minHeight, Math.min(newHeight, maxHeight)) + 'px';
}

function endResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', endResize);
}

// Modifica a função playVideo para incluir opção de popup
function playVideoInPopup(videoId, snippet) {
    const title = snippet ? snippet.title : 'Vídeo';
    const channelTitle = snippet ? snippet.channelTitle : 'Canal';
    openPopupPlayer(videoId, title, channelTitle);
}

// --- Início ---
// Carrega o tema e os vídeos mais populares do Brasil ao abrir a página
loadTheme();

// Inicializa o popup player
initPopupPlayer();

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