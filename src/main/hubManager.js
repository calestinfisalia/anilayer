const { BrowserWindow, dialog, ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { pathToFileURL } = require('url');

class HubManager {
  constructor(getPetManager) {
    this.getPetManager = getPetManager;
    this.win = null;
    this.targetPetId = null;
    this.setupIPC();
  }

  setupIPC() {
    ipcMain.handle('hub:get-active-pets', () => {
      const petManager = this.getPetManager();
      return petManager ? petManager.getAllPetsData() : [];
    });

    ipcMain.handle('hub:get-target-pet-id', () => {
      return this.targetPetId;
    });

    ipcMain.on('hub:set-target-pet', (event, petId) => {
      this.targetPetId = petId;
    });

    ipcMain.on('hub:apply-media-to-pet', (event, { petId, mediaUrl, mediaType }) => {
      const petManager = this.getPetManager();
      if (petManager) {
        petManager.changePetMedia(petId, mediaUrl, mediaType);
      }
    });

    ipcMain.on('hub:spawn-pet', (event, mediaUrl) => {
      const petManager = this.getPetManager();
      if (petManager) {
        petManager.spawnNewPet(mediaUrl);
      }
    });

    ipcMain.on('hub:remove-pet', (event, petId) => {
      const petManager = this.getPetManager();
      if (petManager) {
        petManager.destroyPet(petId);
      }
    });

    ipcMain.on('hub:toggle-pet-flip', (event, petId) => {
      const petManager = this.getPetManager();
      if (petManager) {
        petManager.toggleFlip(petId);
      }
    });

    ipcMain.on('hub:set-pet-opacity', (event, { petId, opacity }) => {
      const petManager = this.getPetManager();
      if (petManager) {
        petManager.setPetOpacity(petId, opacity);
      }
    });

    ipcMain.on('hub:set-pet-size', (event, { petId, size }) => {
      const petManager = this.getPetManager();
      if (petManager) {
        petManager.resizePet(petId, size, size);
      }
    });

    ipcMain.on('hub:toggle-pet-click-through', (event, petId) => {
      const petManager = this.getPetManager();
      if (petManager) {
        petManager.toggleClickThrough(petId);
      }
    });

    ipcMain.handle('hub:pick-local-file', async () => {
      const result = await dialog.showOpenDialog(this.win, {
        title: 'Select Anime GIF, WebP, or Looping Video',
        properties: ['openFile'],
        filters: [
          { name: 'Supported Anime Media', extensions: ['webp', 'gif', 'png', 'mp4', 'webm'] },
          { name: 'Transparent Stickers & Animations', extensions: ['webp', 'gif', 'png'] },
          { name: 'Looping Videos (WebM / MP4)', extensions: ['webm', 'mp4'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const isVideo = filePath.endsWith('.mp4') || filePath.endsWith('.webm');
        return {
          path: pathToFileURL(filePath).href,
          type: isVideo ? 'video' : 'gif'
        };
      }
      return null;
    });

    ipcMain.handle('hub:get-local-presets', (event, transparentOnly = true) => {
      return this.getLocalPresetsFallback(transparentOnly);
    });

    ipcMain.handle('hub:search-anime-media', async (event, { query, category, transparentOnly = true }) => {
      return this.searchAnimeMedia(query, category, transparentOnly);
    });
  }

  async searchAnimeMedia(query, category, transparentOnly = true) {
    let searchTerm = '';
    if (query && query.trim()) {
      searchTerm = query.trim();
    } else if (category && category !== 'all' && category !== 'presets') {
      searchTerm = `${category} anime`;
    } else {
      searchTerm = 'cute anime chibi';
    }

    try {
      const slug = searchTerm.trim().replace(/\s+/g, '-');
      const stickerUrl = `https://tenor.com/search/${encodeURIComponent(slug)}-gifs?format=stickers`;
      const regularUrl = `https://tenor.com/search/${encodeURIComponent(slug)}-gifs`;

      const [stickers, regular] = await Promise.all([
        this.fetchTenorStickers(stickerUrl, searchTerm),
        transparentOnly ? Promise.resolve([]) : this.fetchTenorRegularGifs(regularUrl, searchTerm)
      ]);

      const seen = new Set();
      const combined = [];

      for (const item of stickers) {
        if (!seen.has(item.url)) {
          seen.add(item.url);
          combined.push(item);
        }
      }

      if (!transparentOnly || combined.length < 8) {
        for (const item of regular) {
          if (!seen.has(item.url)) {
            seen.add(item.url);
            combined.push(item);
          }
        }
      }

      if (combined.length > 0) return combined;
    } catch (e) {
      console.warn('Search failed:', e.message);
    }

    return this.getLocalPresetsFallback(transparentOnly);
  }

  fetchTenorStickers(url, searchTerm) {
    return new Promise((resolve) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          const results = [];
          const regex = /<img[^>]+src=["'](https:\/\/media\.tenor\.com\/[^"']+\.webp)["'][^>]*alt=["']([^"']*)["']/g;
          let match;
          const seen = new Set();
          while ((match = regex.exec(data)) !== null) {
            const imgUrl = match[1];
            const alt = match[2] || searchTerm;
            if (!seen.has(imgUrl)) {
              seen.add(imgUrl);
              results.push({
                id: `sticker_${results.length}_${Date.now()}`,
                title: alt.replace(/sticker/gi, '').replace(/gif/gi, '').trim() || searchTerm,
                anime: 'Transparent Sticker',
                transparent: true,
                url: imgUrl,
                previewUrl: imgUrl,
                type: 'webp'
              });
            }
          }

          if (results.length === 0) {
            const rawWebps = [...data.matchAll(/https:\/\/media\.tenor\.com\/[a-zA-Z0-9_\-\/]+\.webp/g)].map(m => m[0]);
            for (const u of rawWebps) {
              if (!seen.has(u)) {
                seen.add(u);
                results.push({
                  id: `sticker_${results.length}_${Date.now()}`,
                  title: searchTerm,
                  anime: 'Transparent Sticker',
                  transparent: true,
                  url: u,
                  previewUrl: u,
                  type: 'webp'
                });
              }
            }
          }

          resolve(results.slice(0, 36));
        });
      }).on('error', () => resolve([]));
    });
  }

  fetchTenorRegularGifs(url, searchTerm) {
    return new Promise((resolve) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          const results = [];
          const regex = /<img[^>]+src=["'](https:\/\/media\.tenor\.com\/[^"']+\.gif)["'][^>]*alt=["']([^"']*)["']/g;
          let match;
          const seen = new Set();
          while ((match = regex.exec(data)) !== null) {
            const imgUrl = match[1];
            const alt = match[2] || searchTerm;
            if (!seen.has(imgUrl)) {
              seen.add(imgUrl);
              results.push({
                id: `gif_${results.length}_${Date.now()}`,
                title: alt.replace(/gif/gi, '').trim() || searchTerm,
                anime: 'Anime GIF',
                transparent: false,
                url: imgUrl,
                previewUrl: imgUrl,
                type: 'gif'
              });
            }
          }
          resolve(results.slice(0, 20));
        });
      }).on('error', () => resolve([]));
    });
  }

  getLocalPresetsFallback(transparentOnly = true) {
    try {
      const presetsJson = path.join(app.getAppPath(), 'assets', 'presets', 'presets.json');
      if (fs.existsSync(presetsJson)) {
        let list = JSON.parse(fs.readFileSync(presetsJson, 'utf8'));
        if (transparentOnly) {
          const trans = list.filter(i => i.transparent);
          if (trans.length > 0) list = trans;
        } else {
          list.sort((a, b) => (b.transparent ? 1 : 0) - (a.transparent ? 1 : 0));
        }

        return list.map(item => {
          const fileUrl = pathToFileURL(path.join(app.getAppPath(), item.url)).href;
          return {
            ...item,
            url: fileUrl,
            previewUrl: fileUrl,
            resolvedUrl: fileUrl
          };
        });
      }
    } catch (e) {
      console.error('Error reading presets:', e);
    }
    return [];
  }

  open(targetPetId = null) {
    this.targetPetId = targetPetId;

    if (this.win && !this.win.isDestroyed()) {
      this.win.show();
      this.win.focus();
      this.win.webContents.send('hub:target-pet-changed', this.targetPetId);
      return;
    }

    this.win = new BrowserWindow({
      width: 980,
      height: 720,
      minWidth: 840,
      minHeight: 580,
      title: 'AniLayer Hub & Anime Store',
      backgroundColor: '#13111c',
      frame: false,
      titleBarStyle: 'hidden',
      hasShadow: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/hub-preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: false
      }
    });

    this.win.loadFile(path.join(__dirname, '../renderer/hub/hub.html'));

    this.win.on('closed', () => {
      this.win = null;
    });

    ipcMain.on('hub:window-minimize', () => {
      if (this.win && !this.win.isDestroyed()) this.win.minimize();
    });

    ipcMain.on('hub:window-maximize', () => {
      if (this.win && !this.win.isDestroyed()) {
        if (this.win.isMaximized()) this.win.unmaximize();
        else this.win.maximize();
      }
    });

    ipcMain.on('hub:window-close', () => {
      if (this.win && !this.win.isDestroyed()) this.win.hide();
    });
  }
}

module.exports = HubManager;
