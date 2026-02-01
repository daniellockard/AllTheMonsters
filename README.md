# All The Monsters

A modern web application that collects and displays all monster stat blocks from D&D 5.1 SRD using the Open5e API.

## Tech Stack

- ⚡ **Vite 7** - Lightning fast dev server and builds
- ⚛️ **React 19** - Latest React with concurrent features
- 🎨 **Tailwind CSS 4** - Modern utility-first styling
- 🎭 **Framer Motion 12** - Smooth animations
- 📜 **Virtual Scrolling** - Handles 3,207 monsters efficiently

## Features

- 🔍 Fetches all monsters from the Open5e API (D&D 5.1 SRD)
- 💾 Saves complete monster data to JSON files
- 📊 Generates statistics and summaries
- 🧪 Includes API testing functionality
- ⚡ Respectful API usage with rate limiting
- 📁 Organized file structure

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Test the API Connection

Before running the full collection, test the API connection:

```bash
npm test
```

This will:
- Test basic API connectivity
- Verify the monsters endpoint
- Test individual monster data retrieval
- Show sample data structure

### Collect All Monsters

Run the full monster collection:

```bash
npm run collect
```

### Web Interface

To run the web interface for browsing monsters:

```bash
npm run dev
```

This will start the Vite development server at `http://localhost:3000/AllTheMonsters/`

### Build for Production

```bash
npm run build:web
```

## Project Structure

```
AllTheMonsters/
├── collector/           # Monster collection scripts
│   ├── index.js        # Main collection script
│   ├── test.js         # API testing script
│   ├── resume.js       # Resume collection script
│   └── debug.js        # API debugging script
├── web/                # React web interface
│   ├── src/            # React components
│   ├── public/         # Static assets
│   └── package.json    # Web app dependencies
├── data/               # Collected monster data
│   └── monsters/       # All monster JSON files
└── package.json        # Main project dependencies
```

## Output Files

The application creates the following files in `data/monsters/`:

- `all-monsters.json` - Complete collection of all monsters
- `summary.json` - Summary with monster names, CR, type, and size
- `statistics.json` - Statistical analysis of the monster collection
- `errors.json` - Any errors encountered during collection
- Individual monster files (e.g., `aboleth.json`, `ancient-dragon.json`)

## Data Structure

Each monster includes:
- Basic info (name, type, size, CR)
- Stats (HP, AC, ability scores)
- Actions and abilities
- Special traits
- And more according to the 5.1 SRD format

## API Information

This project uses the [Open5e API](https://open5e.com/), which provides access to the D&D 5.1 SRD content. The API is free to use and doesn't require authentication for basic usage.

## Rate Limiting

The application includes a 100ms delay between API requests to be respectful to the Open5e servers. This means collecting all monsters will take several minutes.

## Error Handling

- Failed monster fetches are logged and saved to `errors.json`
- The application continues running even if some monsters fail
- Detailed error information is preserved for debugging

## Statistics Generated

The application automatically generates:
- Total monster count
- Distribution by Challenge Rating
- Distribution by monster type
- Distribution by size
- Average stats across all monsters

## License

MIT License - feel free to use this for your own projects! 