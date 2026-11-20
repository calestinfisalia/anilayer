const urlParams = new URLSearchParams(window.location.search);
const petId = urlParams.get('id');

const container = document.getElementById('pet-container');
const mediaWrapper = document.getElementById('media-wrapper');
const petImg = document.getElementById('pet-image');
const petVideo = document.getElementById('pet-video');
const btnWand = document.getElementById('btn-wand');
const btnFlip = document.getElementById('btn-flip');
const btnStore = document.getElementById('btn-store');
const btnClose = document.getElementById('btn-close');
const badge = document.getElementById('badge-notification');

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let winStartX = 0;
let winStartY = 0;
let currentPetData = null;

function showBadge(text, duration = 1800) {
  badge.textContent = text;
  badge.classList.add('show');
  setTimeout(() => badge.classList.remove('show'), duration);
}

function applyMedia(mediaUrl, mediaType) {
  const isVideo = mediaType === 'video' || (mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm')));

  if (isVideo) {
    petImg.style.display = 'none';
    petVideo.src = mediaUrl;
    petVideo.style.display = 'block';
    petVideo.play().catch(e => console.log('Video play error:', e));
  } else {
    petVideo.pause();
    petVideo.style.display = 'none';
    petImg.src = mediaUrl;
    petImg.style.display = 'block';
  }
}

function setRemoveWhiteBg(active) {
  if (active) {
    mediaWrapper.classList.add('remove-white-bg');
    if (btnWand) btnWand.style.background = 'rgba(255, 110, 180, 0.9)';
  } else {
    mediaWrapper.classList.remove('remove-white-bg');
    if (btnWand) btnWand.style.background = '';
  }
}

async function init() {
  if (!petId) return;

  currentPetData = await window.petApi.getPetData(petId);
  if (!currentPetData) return;

  applyMedia(currentPetData.resolvedMediaUrl || currentPetData.mediaUrl, currentPetData.mediaType);

  if (currentPetData.flipped) {
    mediaWrapper.classList.add('flipped');
  }

  if (currentPetData.removeWhiteBg) {
    setRemoveWhiteBg(true);
  }

  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || e.target.closest('.hover-toolbar')) return;

    isDragging = true;
    dragStartX = e.screenX;
    dragStartY = e.screenY;
    winStartX = window.screenX;
    winStartY = window.screenY;

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const deltaX = e.screenX - dragStartX;
    const deltaY = e.screenY - dragStartY;
    const newX = winStartX + deltaX;
    const newY = winStartY + deltaY;
    window.petApi.updatePosition(petId, newX, newY);
  }

  function onMouseUp() {
    isDragging = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  container.addEventListener('dblclick', (e) => {
    if (e.target.closest('.hover-toolbar')) return;
    window.petApi.toggleFlip(petId);
  });

  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.petApi.showContextMenu(petId);
  });

  if (btnWand) {
    btnWand.addEventListener('click', (e) => {
      e.stopPropagation();
      window.petApi.toggleRemoveWhiteBg(petId);
    });
  }

  btnFlip.addEventListener('click', (e) => {
    e.stopPropagation();
    window.petApi.toggleFlip(petId);
  });

  btnStore.addEventListener('click', (e) => {
    e.stopPropagation();
    window.petApi.openHub(petId);
  });

  btnClose.addEventListener('click', (e) => {
    e.stopPropagation();
    window.petApi.removePet(petId);
  });

  window.petApi.onUpdateMedia((data) => {
    applyMedia(data.mediaUrl, data.mediaType);
    showBadge('Animation Updated');
  });

  window.petApi.onSetFlipped((flipped) => {
    if (flipped) mediaWrapper.classList.add('flipped');
    else mediaWrapper.classList.remove('flipped');
  });

  window.petApi.onSetClickThrough((active) => {
    showBadge(active ? 'Ghost Mode ON' : 'Clickable');
  });

  window.petApi.onSetRemoveWhiteBg((active) => {
    setRemoveWhiteBg(active);
    showBadge(active ? 'Chroma-Key (White BG Removed)' : 'White BG Restored');
  });
}

init();
