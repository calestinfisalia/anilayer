// State
let activePets = [];
let targetPetId = null;
let currentTab = 'tab-store';
let customPreviewData = null;

// DOM Elements
const winMin = document.getElementById('win-min');
const winMax = document.getElementById('win-max');
const winClose = document.getElementById('win-close');
const navTabs = document.querySelectorAll('.nav-tab');
const tabPanes = document.querySelectorAll('.tab-pane');

const selectTargetPet = document.getElementById('select-target-pet');
const btnQuickSpawn = document.getElementById('btn-quick-spawn');
const petsCountBadge = document.getElementById('pets-count-badge');

const inputSearch = document.getElementById('input-search');
const btnSearch = document.getElementById('btn-search');
const btnClearSearch = document.getElementById('btn-clear-search');
const btnRandom = document.getElementById('btn-random');
const catPills = document.querySelectorAll('.cat-pill');
const mediaGrid = document.getElementById('media-grid');
const resultsCountText = document.getElementById('results-count-text');
const loadingSpinner = document.getElementById('loading-spinner');

const btnBrowseFile = document.getElementById('btn-browse-file');
const dropzone = document.getElementById('dropzone');
const inputMediaUrl = document.getElementById('input-media-url');
const btnLoadUrl = document.getElementById('btn-load-url');
const customPreviewContainer = document.getElementById('custom-preview-container');
const customPreviewImg = document.getElementById('custom-preview-img');
const customPreviewVideo = document.getElementById('custom-preview-video');
const btnApplyCustom = document.getElementById('btn-apply-custom');
const btnSpawnCustom = document.getElementById('btn-spawn-custom');

const companionsList = document.getElementById('companions-list');
const btnAddCompanionTab = document.getElementById('btn-add-companion-tab');
const toastEl = document.getElementById('toast');

// Toast helper
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2400);
}

// Window controls
winMin.addEventListener('click', () => window.hubApi.minimizeWindow());
winMax.addEventListener('click', () => window.hubApi.maximizeWindow());
winClose.addEventListener('click', () => window.hubApi.closeWindow());

// Navigation Tabs
navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    navTabs.forEach(t => t.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    document.getElementById(target).classList.add('active');
    currentTab = target;

    if (target === 'tab-companions') {
      renderCompanionsList();
    }
  });
});

// Update target pet dropdown
async function updatePetsList() {
  activePets = await window.hubApi.getActivePets();
  petsCountBadge.textContent = activePets.length;

  selectTargetPet.innerHTML = '';
  if (activePets.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No active pets (Spawn one!)';
    selectTargetPet.appendChild(opt);
    targetPetId = null;
    return;
  }

  if (!targetPetId || !activePets.some(p => p.id === targetPetId)) {
    targetPetId = activePets[0].id;
  }

  activePets.forEach((pet, idx) => {
    const opt = document.createElement('option');
    opt.value = pet.id;
    opt.textContent = `${pet.name || `Companion #${idx + 1}`} (${pet.width}x${pet.height})`;
    if (pet.id === targetPetId) opt.selected = true;
    selectTargetPet.appendChild(opt);
  });

  if (currentTab === 'tab-companions') {
    renderCompanionsList();
  }
}

selectTargetPet.addEventListener('change', (e) => {
  targetPetId = e.target.value;
  window.hubApi.setTargetPet(targetPetId);
});

btnQuickSpawn.addEventListener('click', () => {
  window.hubApi.spawnPet(null);
  showToast('New desktop companion spawned');
});

btnAddCompanionTab.addEventListener('click', () => {
  window.hubApi.spawnPet(null);
  showToast('New desktop companion spawned');
});

// Render Store Cards
function renderMediaCards(items, title = 'Results') {
  mediaGrid.innerHTML = '';
  resultsCountText.textContent = `${title} (${items.length})`;

  if (items.length === 0) {
    mediaGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
        <svg style="margin-bottom: 12px; opacity: 0.5;" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <p>No animations found. Try another search term or click a category pill above.</p>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'media-card';

    const isVideo = item.type === 'video' || (item.url && (item.url.endsWith('.mp4') || item.url.endsWith('.webm')));

    const mediaHtml = isVideo
      ? `<video class="media-thumbnail" src="${item.previewUrl || item.url}" autoplay loop muted playsinline></video>`
      : `<img class="media-thumbnail" src="${item.previewUrl || item.url}" alt="${item.title || 'Anime'}" loading="lazy">`;

    const transparentBadge = item.transparent
      ? `<span class="badge-transparent">Transparent</span>`
      : '';

    card.innerHTML = `
      <div class="media-thumbnail-container">
        ${mediaHtml}
        <div class="media-overlay">
          <button class="btn btn-primary btn-sm btn-block btn-apply">
            <svg class="icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span>Set to Active Pet</span>
          </button>
          <button class="btn btn-secondary btn-sm btn-block btn-spawn">
            <svg class="icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            <span>Spawn New Pet</span>
          </button>
        </div>
      </div>
      <div class="media-details">
        <div class="media-title" title="${item.title || 'Anime Loop'}">${item.title || 'Anime Loop'}</div>
        <div class="media-badge">
          <span>${item.type ? item.type.toUpperCase() : 'GIF'}</span>
          <span>•</span>
          <span>${item.anime || 'Anime'}</span>
          ${transparentBadge}
        </div>
      </div>
    `;

    // Apply to selected pet
    card.querySelector('.btn-apply').addEventListener('click', () => {
      const petId = targetPetId || (activePets[0] && activePets[0].id);
      if (!petId) {
        window.hubApi.spawnPet(item.url);
        showToast('Spawned new companion window');
      } else {
        const type = isVideo ? 'video' : 'gif';
        window.hubApi.applyMediaToPet(petId, item.url, type);
        const targetPet = activePets.find(p => p.id === petId);
        showToast(`Applied to ${targetPet ? targetPet.name : 'Companion'}`);
      }
    });

    // Spawn as separate new window
    card.querySelector('.btn-spawn').addEventListener('click', () => {
      window.hubApi.spawnPet(item.url);
      showToast('Spawned new companion window');
    });

    mediaGrid.appendChild(card);
  });
}

// Transparent toggle element
const chkTransparent = document.getElementById('chk-transparent');
if (chkTransparent) {
  chkTransparent.addEventListener('change', () => {
    const query = inputSearch.value.trim();
    const activeCat = document.querySelector('.cat-pill.active');
    const cat = activeCat ? activeCat.getAttribute('data-cat') : 'presets';
    if (query) {
      performSearch(query, null);
    } else if (cat === 'presets') {
      loadPresets();
    } else {
      performSearch(null, cat);
    }
  });
}

// Load presets
async function loadPresets() {
  loadingSpinner.style.display = 'block';
  try {
    const isTransOnly = chkTransparent ? chkTransparent.checked : true;
    const presets = await window.hubApi.getLocalPresets(isTransOnly);
    renderMediaCards(presets, 'Curated Starter Presets');
  } catch (e) {
    console.error(e);
  } finally {
    loadingSpinner.style.display = 'none';
  }
}

// Search
async function performSearch(query, category) {
  loadingSpinner.style.display = 'block';
  try {
    const isTransOnly = chkTransparent ? chkTransparent.checked : true;
    const results = await window.hubApi.searchAnimeMedia(query, category, isTransOnly);
    const label = query ? `Search: "${query}"` : `Category: ${category}`;
    renderMediaCards(results, label);
  } catch (e) {
    console.error(e);
    showToast('Search error. Showing presets.');
    loadPresets();
  } finally {
    loadingSpinner.style.display = 'none';
  }
}

// Category pill clicks
catPills.forEach(pill => {
  pill.addEventListener('click', () => {
    catPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    const cat = pill.getAttribute('data-cat');
    inputSearch.value = '';
    btnClearSearch.style.display = 'none';

    if (cat === 'presets') {
      loadPresets();
    } else {
      performSearch(null, cat);
    }
  });
});

// Search input
btnSearch.addEventListener('click', () => {
  const query = inputSearch.value.trim();
  if (query) {
    catPills.forEach(p => p.classList.remove('active'));
    btnClearSearch.style.display = 'flex';
    performSearch(query, null);
  }
});

inputSearch.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    btnSearch.click();
  }
});

inputSearch.addEventListener('input', () => {
  btnClearSearch.style.display = inputSearch.value ? 'flex' : 'none';
});

btnClearSearch.addEventListener('click', () => {
  inputSearch.value = '';
  btnClearSearch.style.display = 'none';
  catPills[0].click();
});

btnRandom.addEventListener('click', () => {
  const categories = ['dance', 'nya', 'happy', 'pat', 'wave', 'nom', 'sleep', 'spin', 'smug', 'blush', 'run'];
  const randomCat = categories[Math.floor(Math.random() * categories.length)];
  
  catPills.forEach(p => {
    if (p.getAttribute('data-cat') === randomCat) p.classList.add('active');
    else p.classList.remove('active');
  });

  performSearch(null, randomCat);
  showToast(`Category: ${randomCat}`);
});

// TAB 2: Custom & Local Media
function showCustomPreview(url, type) {
  customPreviewData = { url, type };
  customPreviewContainer.style.display = 'block';

  if (type === 'video') {
    customPreviewImg.style.display = 'none';
    customPreviewVideo.src = url;
    customPreviewVideo.style.display = 'block';
    customPreviewVideo.play().catch(e => console.log(e));
  } else {
    customPreviewVideo.pause();
    customPreviewVideo.style.display = 'none';
    customPreviewImg.src = url;
    customPreviewImg.style.display = 'block';
  }
}

btnBrowseFile.addEventListener('click', async () => {
  const file = await window.hubApi.pickLocalFile();
  if (file) {
    showCustomPreview(file.path, file.type);
    showToast('File loaded for preview');
  }
});

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');

  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    const filePath = file.path;
    const isVideo = filePath.endsWith('.mp4') || filePath.endsWith('.webm');
    showCustomPreview(filePath, isVideo ? 'video' : 'gif');
    showToast('File dropped for preview');
  }
});

btnLoadUrl.addEventListener('click', () => {
  const url = inputMediaUrl.value.trim();
  if (!url) return;
  const isVideo = url.endsWith('.mp4') || url.endsWith('.webm');
  showCustomPreview(url, isVideo ? 'video' : 'gif');
  showToast('Web URL loaded for preview');
});

btnApplyCustom.addEventListener('click', () => {
  if (!customPreviewData) return;
  const petId = targetPetId || (activePets[0] && activePets[0].id);
  if (!petId) {
    window.hubApi.spawnPet(customPreviewData.url);
    showToast('New desktop companion spawned');
  } else {
    window.hubApi.applyMediaToPet(petId, customPreviewData.url, customPreviewData.type);
    showToast('Custom media applied to companion');
  }
});

btnSpawnCustom.addEventListener('click', () => {
  if (!customPreviewData) return;
  window.hubApi.spawnPet(customPreviewData.url);
  showToast('Spawned new companion window');
});

// TAB 3: Companions List
function renderCompanionsList() {
  companionsList.innerHTML = '';

  if (activePets.length === 0) {
    companionsList.innerHTML = `
      <div style="text-align: center; padding: 48px; color: var(--text-muted);">
        <p>No companions currently active on your desktop.</p>
        <button id="btn-spawn-first" class="btn btn-primary" style="margin-top: 14px;">
          <svg class="icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>Spawn Companion</span>
        </button>
      </div>
    `;
    const btn = document.getElementById('btn-spawn-first');
    if (btn) btn.addEventListener('click', () => window.hubApi.spawnPet(null));
    return;
  }

  activePets.forEach((pet, index) => {
    const row = document.createElement('div');
    row.className = 'companion-row';

    const isVideo = pet.mediaType === 'video' || (pet.mediaUrl && (pet.mediaUrl.endsWith('.mp4') || pet.mediaUrl.endsWith('.webm')));
    const thumbHtml = isVideo
      ? `<video src="${pet.mediaUrl}" autoplay loop muted playsinline></video>`
      : `<img src="${pet.mediaUrl}" alt="pet">`;

    row.innerHTML = `
      <div class="companion-thumb">
        ${thumbHtml}
      </div>
      <div class="companion-info">
        <div class="companion-title">
          <span>${pet.name || `Companion #${index + 1}`}</span>
          ${pet.id === targetPetId ? '<span class="brand-tag" style="color:var(--accent);">Active Target</span>' : ''}
        </div>
        <div class="companion-controls">
          <div class="control-item">
            <label>Size:</label>
            <input type="range" class="slider-size" min="120" max="450" step="10" value="${pet.width || 240}">
            <span class="size-val">${pet.width || 240}px</span>
          </div>
          <div class="control-item">
            <label>Opacity:</label>
            <input type="range" class="slider-opacity" min="0.2" max="1.0" step="0.05" value="${pet.opacity ?? 1.0}">
            <span class="opacity-val">${Math.round((pet.opacity ?? 1.0) * 100)}%</span>
          </div>
          <button class="btn btn-secondary btn-sm btn-flip">
            <svg class="icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 7 5 5-5 5V7Z"/><path d="m21 7-5 5 5 5V7Z"/><path d="M12 20v2"/><path d="M12 14v2"/><path d="M12 8v2"/><path d="M12 2v2"/></svg>
            <span>${pet.flipped ? 'Flipped' : 'Normal'}</span>
          </button>
          <button class="btn btn-secondary btn-sm btn-ghost">
            <svg class="icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
            <span>${pet.clickThrough ? 'Ghost ON' : 'Ghost OFF'}</span>
          </button>
        </div>
      </div>
      <div class="companion-actions">
        <button class="btn btn-outline btn-sm btn-select-target" title="Set as target for Store">
          <svg class="icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
          <span>Target</span>
        </button>
        <button class="btn btn-danger btn-sm btn-remove" title="Remove companion window">
          <svg class="icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    `;

    const sliderSize = row.querySelector('.slider-size');
    const sizeVal = row.querySelector('.size-val');
    sliderSize.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      sizeVal.textContent = `${val}px`;
      window.hubApi.setPetSize(pet.id, val);
    });

    const sliderOpacity = row.querySelector('.slider-opacity');
    const opacityVal = row.querySelector('.opacity-val');
    sliderOpacity.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      opacityVal.textContent = `${Math.round(val * 100)}%`;
      window.hubApi.setPetOpacity(pet.id, val);
    });

    row.querySelector('.btn-flip').addEventListener('click', () => {
      window.hubApi.togglePetFlip(pet.id);
    });

    row.querySelector('.btn-ghost').addEventListener('click', () => {
      window.hubApi.togglePetClickThrough(pet.id);
    });

    row.querySelector('.btn-select-target').addEventListener('click', () => {
      targetPetId = pet.id;
      selectTargetPet.value = pet.id;
      window.hubApi.setTargetPet(pet.id);
      renderCompanionsList();
      showToast(`Targeting ${pet.name || `Companion #${index + 1}`}`);
    });

    row.querySelector('.btn-remove').addEventListener('click', () => {
      window.hubApi.removePet(pet.id);
      showToast('Companion removed');
    });

    companionsList.appendChild(row);
  });
}

// IPC event listeners from main
window.hubApi.onPetsUpdated((pets) => {
  activePets = pets;
  updatePetsList();
});

window.hubApi.onTargetPetChanged((newTargetId) => {
  targetPetId = newTargetId;
  updatePetsList();
});

async function init() {
  await updatePetsList();
  loadPresets();
}

init();
