const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hubApi', {
  getActivePets: () => ipcRenderer.invoke('hub:get-active-pets'),
  getTargetPetId: () => ipcRenderer.invoke('hub:get-target-pet-id'),
  setTargetPet: (petId) => ipcRenderer.send('hub:set-target-pet', petId),
  applyMediaToPet: (petId, mediaUrl, mediaType) => ipcRenderer.send('hub:apply-media-to-pet', { petId, mediaUrl, mediaType }),
  spawnPet: (mediaUrl) => ipcRenderer.send('hub:spawn-pet', mediaUrl),
  removePet: (petId) => ipcRenderer.send('hub:remove-pet', petId),
  togglePetFlip: (petId) => ipcRenderer.send('hub:toggle-pet-flip', petId),
  setPetOpacity: (petId, opacity) => ipcRenderer.send('hub:set-pet-opacity', { petId, opacity }),
  setPetSize: (petId, size) => ipcRenderer.send('hub:set-pet-size', { petId, size }),
  togglePetClickThrough: (petId) => ipcRenderer.send('hub:toggle-pet-click-through', petId),

  pickLocalFile: () => ipcRenderer.invoke('hub:pick-local-file'),
  getLocalPresets: (transparentOnly) => ipcRenderer.invoke('hub:get-local-presets', transparentOnly),
  searchAnimeMedia: (query, category, transparentOnly) => ipcRenderer.invoke('hub:search-anime-media', { query, category, transparentOnly }),

  minimizeWindow: () => ipcRenderer.send('hub:window-minimize'),
  maximizeWindow: () => ipcRenderer.send('hub:window-maximize'),
  closeWindow: () => ipcRenderer.send('hub:window-close'),

  onPetsUpdated: (callback) => ipcRenderer.on('hub:pets-updated', (event, pets) => callback(pets)),
  onTargetPetChanged: (callback) => ipcRenderer.on('hub:target-pet-changed', (event, petId) => callback(petId))
});
