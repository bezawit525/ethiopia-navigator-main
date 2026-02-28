# 🗺️ Gebeta Navigate — Ethiopian Navigation App

A modern, bilingual navigation web app for Ethiopia powered by [Gebeta Maps API](https://gebeta.app). Search places, get turn-by-turn directions, and explore Ethiopia — all in **English** and **Amharic (አማርኛ)**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Place Search** | Search for locations across Ethiopia with real-time suggestions via Gebeta Geocoding API |
| 🧭 **Turn-by-Turn Directions** | Get route directions between any two points with distance and duration estimates |
| 🌍 **Bilingual UI** | Full support for **English** and **Amharic** — switch languages at any time |
| 📍 **Geolocation** | Detect your current location and use it as a starting point |
| 🗺️ **Interactive Map** | Pan, zoom, and tap to select origin/destination directly on the map (Leaflet) |
| 🚗 **Travel Modes** | Choose between **Driving** and **Walking** routes |
| 📌 **Reverse Geocoding** | Tap anywhere on the map to get the place name |
| 🎮 **Demo Mode** | Try the app instantly without an API key — explore with built-in sample places |
| 🎨 **Smooth Animations** | Polished UI with Framer Motion transitions and glassmorphism design |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://react.dev) + [TypeScript](https://typescriptlang.org) |
| **Build Tool** | [Vite 5](https://vitejs.dev) |
| **Routing** | [React Router v6](https://reactrouter.com) |
| **Maps** | [Leaflet](https://leafletjs.com) |
| **API** | [Gebeta Maps API](https://gebeta.app) (Geocoding, Directions, Reverse Geocoding) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com) |
| **Animations** | [Framer Motion](https://www.framer.com/motion) |
| **State / Data** | [TanStack React Query](https://tanstack.com/query) |
| **Forms** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **SEO** | [react-helmet-async](https://github.com/staylor/react-helmet-async) |

---

## 📁 Project Structure

```
ethiopia-navigator-main/
├── public/                     # Static assets (favicon, robots.txt)
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (Button, Toast, Dialog, etc.)
│   │   ├── ApiKeyInput.tsx     # API key entry form
│   │   ├── LanguageToggle.tsx  # EN / AM language switch
│   │   ├── MapComponent.tsx    # Leaflet interactive map
│   │   ├── ModeSelector.tsx    # Driving / Walking mode picker
│   │   ├── RoutePanel.tsx      # Route details & step-by-step instructions
│   │   └── SearchBar.tsx       # Place search with autocomplete
│   ├── contexts/
│   │   └── LanguageContext.tsx  # i18n provider (English & Amharic translations)
│   ├── hooks/
│   │   ├── useGebetaApi.ts     # Gebeta Maps API integration & demo mode
│   │   ├── use-mobile.tsx      # Responsive breakpoint hook
│   │   └── use-toast.ts        # Toast notification hook
│   ├── lib/
│   │   └── utils.ts            # Utility helpers
│   ├── pages/
│   │   ├── Index.tsx           # Main navigation page
│   │   └── NotFound.tsx        # 404 page
│   ├── App.tsx                 # Root component with providers & routing
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles & Tailwind directives
├── index.html                  # HTML entry with SEO meta tags
├── tailwind.config.ts          # Tailwind CSS configuration
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── components.json             # shadcn/ui configuration
└── package.json                # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or **bun**)

### Installation

```bash
# Clone the repository
git clone https://github.com/bezawit525/ethiopia-navigator-main.git
cd ethiopia-navigator-main

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

The app will start at **http://localhost:5173**.

### Building for Production

```bash
npm run build
npm run preview    # Preview the production build locally
```

---

## 🔑 API Key Setup

Gebeta Navigate uses the **Gebeta Maps API** for geocoding, reverse geocoding, and routing.

1. Get a free API key at [gebeta.app](https://gebeta.app).
2. When you open the app, you'll be prompted to enter your API key.
3. The key is saved in your browser's `localStorage` — you only need to enter it once.

> **💡 Demo Mode:** You can skip the API key step entirely! The app ships with a built-in demo mode that uses sample Ethiopian landmarks (Bole Airport, Meskel Square, Merkato, and more) so you can explore the UI immediately.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run build:dev` | Create a development build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

## 🌐 Internationalization

The app fully supports two languages:

- 🇬🇧 **English** — default language
- 🇪🇹 **Amharic (አማርኛ)** — switch via the language toggle in the header

All UI strings, navigation instructions, units, and status messages are translated. The language preference can be changed at any point without reloading the page.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m "feat: add my feature"`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open source. See the repository for license details.

---

## 👩‍💻 Author

**Bezawit Hayle**

---

<p align="center">
  Built with ❤️ for Ethiopia 🇪🇹
</p>
