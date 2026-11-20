const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petApi', {
  getPetData: (petId) => ipcRenderer.invoke('pet:get-data', petId),
  updatePosition: (petId, x, y) => ipcRenderer.send('pet:update-position', { petId, x, y }),
  updateSize: (petId, width, height) => ipcRenderer.send('pet:update-size', { petId, width, height }),
  toggleFlip: (petId) => ipcRenderer.send('pet:toggle-flip', petId),
  setOpacity: (petId, opacity) => ipcRenderer.send('pet:set-opacity', { petId, opacity }),
  toggleClickThrough: (petId) => ipcRenderer.send('pet:toggle-click-through', petId),
  toggleRemoveWhiteBg: (petId) => ipcRenderer.send('pet:toggle-remove-white-bg', petId),
  removePet: (petId) => ipcRenderer.send('pet:remove', petId),
  openHub: (petId) => ipcRenderer.send('pet:open-hub', petId),
  showContextMenu: (petId) => ipcRenderer.send('pet:show-context-menu', petId),

  onUpdateMedia: (callback) => ipcRenderer.on('pet:update-media', (event, data) => callback(data)),
  onSetFlipped: (callback) => ipcRenderer.on('pet:set-flipped', (event, flipped) => callback(flipped)),
  onSetClickThrough: (callback) => ipcRenderer.on('pet:set-click-through', (event, active) => callback(active)),
  onSetRemoveWhiteBg: (callback) => ipcRenderer.on('pet:set-remove-white-bg', (event, active) => callback(active))
});
