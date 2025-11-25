# mdgraph2

A desktop application for visualizing markdown files as an interactive graph. It scans markdown files, parses wiki-links (`[[name]]`), and builds a network graph for visual exploration.

## Features

- **Wiki-link parsing** - Detects `[[wiki-links]]` between markdown files
- **Phantom nodes** - Shows broken links to non-existent files
- **Vim-like keybindings** - Navigate with `hjkl`, search with `/`, command mode with `:`

## Tech Stack

- **Backend**: Tauri 2 + Rust
- **Frontend**: React 19 + TypeScript
- **Graph rendering**: vis-network
- **State management**: Zustand
- **Styling**: Tailwind CSS

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Build from source

```bash
# Clone the repository
git clone https://github.com/Chupik13/mdgraph2.git
cd mdgraph2

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Usage

Launch the application and point it to a directory containing your markdown files. The app will scan for `.md` files, parse wiki-links, and display an interactive graph.

### Keybindings

| Key | Action |
|-----|--------|
| `h/j/k/l` | Navigate between nodes (vim-style) |
| `w/b` | Jump to connected nodes |
| `Space` | Select focused node |
| `/` | Search mode |
| `:` | Command mode |
| `o` | Open file in nvim |
| `Esc` | Return to normal mode |

### Configuration

Configuration can be provided via:
1. CLI flags
2. `--config` JSON file
3. `./config.json` in the app directory

Options:
- `root_dir` - Directory containing markdown files
- `template_phantom_node` - Template for creating notes from phantom nodes

## Development

```bash
# Frontend only (Vite dev server)
npm run dev:vite

# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

## License

MIT License - see [LICENSE](LICENSE) for details.
