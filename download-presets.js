const fs = require('fs');
const path = require('path');
const https = require('https');

const categories = [
  { name: 'dance', title: 'Anime Dance' },
  { name: 'nya', title: 'Neko Nya' },
  { name: 'happy', title: 'Happy Energy' },
  { name: 'pat', title: 'Headpat' },
  { name: 'wave', title: 'Cute Wave' },
  { name: 'nom', title: 'Snack Nom' },
  { name: 'sleep', title: 'Sleepy Chibi' },
  { name: 'spin', title: 'Kurukuru Spin' }
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'AniLayer/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'AniLayer/1.0' } }, (res) => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  const presetsDir = path.join(__dirname, 'assets', 'presets');
  if (!fs.existsSync(presetsDir)) fs.mkdirSync(presetsDir, { recursive: true });

  const metadata = [];

  for (const cat of categories) {
    try {
      console.log(`Fetching preset for ${cat.name}...`);
      const data = await fetchJson(`https://nekos.best/api/v2/${cat.name}?amount=1`);
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        const filename = `${cat.name}.gif`;
        const dest = path.join(presetsDir, filename);
        await downloadFile(item.url, dest);
        console.log(`Saved ${filename}`);
        metadata.push({
          id: cat.name,
          title: cat.title,
          anime: item.anime_name || 'Anime',
          filename: filename,
          url: `assets/presets/${filename}`,
          type: 'gif'
        });
      }
    } catch (e) {
      console.error(`Failed ${cat.name}:`, e.message);
    }
  }

  fs.writeFileSync(path.join(presetsDir, 'presets.json'), JSON.stringify(metadata, null, 2));
  console.log('Presets downloaded successfully!');
}

run();
