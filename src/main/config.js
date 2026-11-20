const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class ConfigManager {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'anilayer-config.json');
    this.defaultConfig = {
      pets: [
        {
          id: 'pet_default_1',
          name: 'Yae Miko Chibi',
          mediaUrl: 'assets/presets/yae-miko.webp',
          mediaType: 'webp',
          width: 240,
          height: 240,
          x: null,
          y: null,
          flipped: false,
          opacity: 1.0,
          removeWhiteBg: false,
          clickThrough: false,
          muted: true
        }
      ],
      settings: {
        autoStart: false,
        soundVolume: 0,
        alwaysOnTop: true
      }
    };
    this.config = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf8');
        const parsed = JSON.parse(raw);
        return { ...this.defaultConfig, ...parsed };
      }
    } catch (e) {
      console.error('Error loading config:', e);
    }
    return JSON.parse(JSON.stringify(this.defaultConfig));
  }

  save() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving config:', e);
    }
  }

  getPets() {
    return this.config.pets || [];
  }

  savePets(pets) {
    this.config.pets = pets;
    this.save();
  }

  updatePet(id, updates) {
    const idx = this.config.pets.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.config.pets[idx] = { ...this.config.pets[idx], ...updates };
      this.save();
    }
  }

  removePet(id) {
    this.config.pets = this.config.pets.filter(p => p.id !== id);
    this.save();
  }

  addPet(pet) {
    this.config.pets.push(pet);
    this.save();
  }
}

module.exports = ConfigManager;
