# AniLayer

AniLayer is a Windows desktop companion app that displays animated media in transparent, always-on-top windows. It is built with Electron and supports multiple companions at once.

## Features

- **Transparent desktop companions** — borderless, always-on-top windows that can be freely dragged and flipped.
- **Multiple companions** — run independent windows with separately saved media, position, size, direction, opacity, and click-through settings.
- **Store & Search Hub** — browse local presets, search Tenor stickers and animations, explore categories, and pick a random animation. Online search requires an internet connection.
- **Custom media** — select or drag in a local file, or enter a direct media URL. Supported formats: GIF, WebP, PNG, MP4, and WebM.
- **Companion controls** — resize, adjust opacity, toggle Ghost Mode (click-through), remove a white background (chroma key), change media, or close a companion.
- **System tray** — open the Hub, spawn a companion, show or hide all companions, or quit the app.
- **Local state** — active companion positions and preferences are saved locally. Closed companions are removed and are not restored when the app restarts.

> Search results and media loaded from URLs are provided by their respective services and owners. AniLayer does not control their availability, terms of use, or media rights.

## Requirements

- Windows 10 or later.
- Node.js 22.12 or later and npm to run from source.

## Run from source

```powershell
git clone https://github.com/calestinfisalia/anilayer.git
cd anilayer
npm ci
npm start
```

To build the Windows portable application:

```powershell
npm run build
```

Build output is written to `dist/`. Electron and electron-builder dependencies are installed with `npm ci`.

## Data and privacy

Companion settings are stored locally in `anilayer-config.json` under Electron's `userData` directory. Online searches send the search term to Tenor. AniLayer does not provide user accounts or its own backend server.

## Contributing

Bug reports, feature requests, and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before contributing, and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

AniLayer source code is licensed under the **GNU General Public License v3.0 or later**. See [LICENSE](LICENSE).

Media in `assets/presets/` may have separate rights or license terms and is not automatically licensed under the GPL. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) before reusing or redistributing media. The software license does not replace permissions required for visual works.

## Security

To report a vulnerability privately, follow the instructions in [SECURITY.md](SECURITY.md).
