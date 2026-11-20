const { app, Tray, Menu, nativeImage, nativeTheme, session } = require('electron');
const path = require('path');
const ConfigManager = require('./config');
const PetManager = require('./petManager');
const HubManager = require('./hubManager');

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let tray = null;
let configManager = null;
let petManager = null;
let hubManager = null;

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';

  // Fix 403 Forbidden: Strip Referer and set standard Chrome User-Agent on all outgoing web requests
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    delete details.requestHeaders['Referer'];
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  configManager = new ConfigManager();
  
  hubManager = new HubManager(() => petManager);
  petManager = new PetManager(configManager, () => hubManager);

  petManager.initFromConfig();

  createTray();

  // Open Hub window so user can discover and choose animations
  hubManager.open();

  app.on('second-instance', () => {
    if (hubManager) {
      hubManager.open();
    }
  });

  app.on('activate', () => {
    if (hubManager && !hubManager.win) {
      hubManager.open();
    }
  });
});

function createTray() {
  const iconPath = path.join(__dirname, '../../assets/icons/icon.svg');
  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    icon = nativeImage.createEmpty();
  } else {
    icon = icon.resize({ width: 18, height: 18 });
  }

  tray = new Tray(icon);
  tray.setToolTip('AniLayer - Desktop Anime Companions');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open AniLayer Store & Hub',
      click: () => {
        if (hubManager) hubManager.open();
      }
    },
    {
      label: 'Spawn New Companion (Beda Window)',
      click: () => {
        if (petManager) petManager.spawnNewPet();
      }
    },
    { type: 'separator' },
    {
      label: 'Show All Companions',
      click: () => {
        if (petManager) petManager.showAll();
      }
    },
    {
      label: 'Hide All Companions',
      click: () => {
        if (petManager) petManager.hideAll();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit AniLayer',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (hubManager) hubManager.open();
  });
}

app.on('window-all-closed', () => {
  if (app.isQuiting) {
    app.quit();
  }
});
