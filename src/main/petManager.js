const { BrowserWindow, screen, Menu, ipcMain, app } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

function toMediaUrl(inputPath) {
  if (!inputPath) return '';
  if (inputPath.startsWith('http://') || inputPath.startsWith('https://') || inputPath.startsWith('data:') || inputPath.startsWith('file://')) {
    return inputPath;
  }
  const absPath = path.isAbsolute(inputPath) ? inputPath : path.join(app.getAppPath(), inputPath);
  return pathToFileURL(absPath).href;
}

class PetManager {
  constructor(configManager, hubManagerRef) {
    this.configManager = configManager;
    this.getHubManager = hubManagerRef;
    this.petWindows = new Map();
    this.setupIPC();
  }

  setupIPC() {
    ipcMain.handle('pet:get-data', (event, petId) => {
      const pet = this.petWindows.get(petId);
      return pet ? pet.data : null;
    });

    ipcMain.on('pet:update-position', (event, { petId, x, y }) => {
      const pet = this.petWindows.get(petId);
      if (pet) {
        pet.data.x = Math.round(x);
        pet.data.y = Math.round(y);
        pet.win.setPosition(pet.data.x, pet.data.y);
        this.configManager.updatePet(petId, { x: pet.data.x, y: pet.data.y });
      }
    });

    ipcMain.on('pet:update-size', (event, { petId, width, height }) => {
      this.resizePet(petId, width, height);
    });

    ipcMain.on('pet:toggle-flip', (event, petId) => {
      this.toggleFlip(petId);
    });

    ipcMain.on('pet:set-opacity', (event, { petId, opacity }) => {
      this.setPetOpacity(petId, opacity);
    });

    ipcMain.on('pet:toggle-click-through', (event, petId) => {
      this.toggleClickThrough(petId);
    });

    ipcMain.on('pet:toggle-remove-white-bg', (event, petId) => {
      this.toggleRemoveWhiteBg(petId);
    });

    ipcMain.on('pet:remove', (event, petId) => {
      this.destroyPet(petId);
    });

    ipcMain.on('pet:open-hub', (event, petId) => {
      const hub = this.getHubManager();
      if (hub) hub.open(petId);
    });

    ipcMain.on('pet:show-context-menu', (event, petId) => {
      this.showContextMenu(petId);
    });
  }

  createPetWindow(petData) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    const width = petData.width || 240;
    const height = petData.height || 240;

    let x = petData.x;
    let y = petData.y;
    if (x === null || x === undefined || y === null || y === undefined) {
      const count = this.petWindows.size;
      x = Math.max(50, screenWidth - width - 40 - (count * 70));
      y = Math.max(50, screenHeight - height - 40 - (count * 40));
    }

    const win = new BrowserWindow({
      width: width,
      height: height,
      x: Math.round(x),
      y: Math.round(y),
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: true,
      hasShadow: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/pet-preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: false
      }
    });

    const resolvedMediaUrl = toMediaUrl(petData.mediaUrl);

    const instanceData = {
      ...petData,
      x,
      y,
      width,
      height,
      resolvedMediaUrl,
      flipped: !!petData.flipped,
      opacity: petData.opacity ?? 1.0,
      clickThrough: !!petData.clickThrough,
      muted: petData.muted ?? true
    };

    this.petWindows.set(petData.id, { win, data: instanceData });

    win.loadFile(path.join(__dirname, '../renderer/pet/pet.html'), {
      query: { id: petData.id }
    });

    win.on('moved', () => {
      const [newX, newY] = win.getPosition();
      instanceData.x = newX;
      instanceData.y = newY;
      this.configManager.updatePet(petData.id, { x: newX, y: newY });
      this.notifyHub();
    });

    win.on('resized', () => {
      const [newW, newH] = win.getSize();
      instanceData.width = newW;
      instanceData.height = newH;
      this.configManager.updatePet(petData.id, { width: newW, height: newH });
      this.notifyHub();
    });

    win.on('closed', () => {
      this.petWindows.delete(petData.id);
      this.configManager.removePet(petData.id);
      this.notifyHub();
    });

    return win;
  }

  spawnNewPet(initialMedia = null) {
    const id = 'pet_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const presets = [
      'assets/presets/yae-miko.webp',
      'assets/presets/bocchi.webp',
      'assets/presets/anya.webp',
      'assets/presets/dance.webp',
      'assets/presets/cat-chibi.webp',
      'assets/presets/happy.webp',
      'assets/presets/sleep.webp'
    ];
    const defaultMedia = initialMedia || presets[this.petWindows.size % presets.length];
    const isVideo = defaultMedia.endsWith('.mp4') || defaultMedia.endsWith('.webm');
    const isWebp = defaultMedia.endsWith('.webp');

    const newPetData = {
      id,
      name: `Companion #${this.petWindows.size + 1}`,
      mediaUrl: defaultMedia,
      mediaType: isVideo ? 'video' : (isWebp ? 'webp' : 'gif'),
      width: 240,
      height: 240,
      x: null,
      y: null,
      flipped: false,
      opacity: 1.0,
      removeWhiteBg: false,
      clickThrough: false,
      muted: true
    };

    this.configManager.addPet(newPetData);
    const win = this.createPetWindow(newPetData);
    this.notifyHub();
    return win;
  }

  changePetMedia(petId, mediaUrl, mediaType = null) {
    const pet = this.petWindows.get(petId);
    if (!pet) return false;

    let type = mediaType;
    if (!type) {
      type = (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm')) ? 'video' : 'gif';
    }

    const resolvedMediaUrl = toMediaUrl(mediaUrl);

    pet.data.mediaUrl = mediaUrl;
    pet.data.resolvedMediaUrl = resolvedMediaUrl;
    pet.data.mediaType = type;

    this.configManager.updatePet(petId, { mediaUrl, mediaType: type });
    pet.win.webContents.send('pet:update-media', {
      mediaUrl: resolvedMediaUrl,
      mediaType: type
    });

    this.notifyHub();
    return true;
  }

  resizePet(petId, width, height) {
    const pet = this.petWindows.get(petId);
    if (!pet) return;
    pet.data.width = width;
    pet.data.height = height;
    pet.win.setSize(Math.round(width), Math.round(height));
    this.configManager.updatePet(petId, { width, height });
    this.notifyHub();
  }

  toggleFlip(petId) {
    const pet = this.petWindows.get(petId);
    if (!pet) return;
    pet.data.flipped = !pet.data.flipped;
    pet.win.webContents.send('pet:set-flipped', pet.data.flipped);
    this.configManager.updatePet(petId, { flipped: pet.data.flipped });
    this.notifyHub();
  }

  setPetOpacity(petId, opacity) {
    const pet = this.petWindows.get(petId);
    if (!pet) return;
    pet.data.opacity = opacity;
    pet.win.setOpacity(opacity);
    this.configManager.updatePet(petId, { opacity });
    this.notifyHub();
  }

  toggleClickThrough(petId) {
    const pet = this.petWindows.get(petId);
    if (!pet) return;
    pet.data.clickThrough = !pet.data.clickThrough;
    pet.win.setIgnoreMouseEvents(pet.data.clickThrough, { forward: true });
    this.configManager.updatePet(petId, { clickThrough: pet.data.clickThrough });
    pet.win.webContents.send('pet:set-click-through', pet.data.clickThrough);
    this.notifyHub();
  }

  toggleRemoveWhiteBg(petId) {
    const pet = this.petWindows.get(petId);
    if (!pet) return;
    pet.data.removeWhiteBg = !pet.data.removeWhiteBg;
    this.configManager.updatePet(petId, { removeWhiteBg: pet.data.removeWhiteBg });
    pet.win.webContents.send('pet:set-remove-white-bg', pet.data.removeWhiteBg);
    this.notifyHub();
  }

  destroyPet(petId) {
    const pet = this.petWindows.get(petId);
    if (pet) {
      pet.win.close();
    }
  }

  showContextMenu(petId) {
    const pet = this.petWindows.get(petId);
    if (!pet) return;

    const template = [
      {
        label: 'Open AniLayer Store & Search',
        click: () => {
          const hub = this.getHubManager();
          if (hub) hub.open(petId);
        }
      },
      {
        label: 'Spawn New Companion (Beda Window)',
        click: () => {
          this.spawnNewPet();
        }
      },
      { type: 'separator' },
      {
        label: 'Flip Direction (Mirror)',
        click: () => this.toggleFlip(petId)
      },
      {
        label: pet.data.removeWhiteBg ? 'Disable White BG Removal' : 'Remove White Background (Chroma-Key)',
        click: () => this.toggleRemoveWhiteBg(petId)
      },
      {
        label: 'Size',
        submenu: [
          { label: 'Tiny (140px)', click: () => this.resizePet(petId, 140, 140) },
          { label: 'Small (180px)', click: () => this.resizePet(petId, 180, 180) },
          { label: 'Normal (240px)', click: () => this.resizePet(petId, 240, 240) },
          { label: 'Big (320px)', click: () => this.resizePet(petId, 320, 320) },
          { label: 'Huge (420px)', click: () => this.resizePet(petId, 420, 420) }
        ]
      },
      {
        label: 'Opacity',
        submenu: [
          { label: '100% Solid', click: () => this.setPetOpacity(petId, 1.0) },
          { label: '85% Soft', click: () => this.setPetOpacity(petId, 0.85) },
          { label: '65% Ghost', click: () => this.setPetOpacity(petId, 0.65) },
          { label: '40% Faint', click: () => this.setPetOpacity(petId, 0.4) }
        ]
      },
      {
        label: pet.data.clickThrough ? 'Disable Ghost Mode (Clickable)' : 'Ghost Mode (Click-Through)',
        click: () => this.toggleClickThrough(petId)
      },
      { type: 'separator' },
      {
        label: 'Remove This Companion',
        click: () => this.destroyPet(petId)
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: pet.win });
  }

  getAllPetsData() {
    const list = [];
    for (const [id, item] of this.petWindows.entries()) {
      list.push({
        id,
        name: item.data.name || `Pet ${id}`,
        mediaUrl: item.data.resolvedMediaUrl || item.data.mediaUrl,
        mediaType: item.data.mediaType,
        width: item.data.width,
        height: item.data.height,
        flipped: item.data.flipped,
        opacity: item.data.opacity,
        clickThrough: item.data.clickThrough
      });
    }
    return list;
  }

  notifyHub() {
    const hub = this.getHubManager();
    if (hub && hub.win && !hub.win.isDestroyed()) {
      hub.win.webContents.send('hub:pets-updated', this.getAllPetsData());
    }
  }

  showAll() {
    for (const item of this.petWindows.values()) {
      item.win.show();
    }
  }

  hideAll() {
    for (const item of this.petWindows.values()) {
      item.win.hide();
    }
  }

  initFromConfig() {
    const savedPets = this.configManager.getPets();
    if (savedPets && savedPets.length > 0) {
      savedPets.forEach(p => this.createPetWindow(p));
    } else {
      this.spawnNewPet('assets/presets/nya.gif');
    }
  }
}

module.exports = PetManager;
