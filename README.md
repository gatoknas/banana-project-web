# 🍍 Banana Project Web App (Ayurami)

> **A premium, modern web dashboard powering the frontend management operations of the Banana Project ecosystem.**

---

## 📖 Purpose

The **Banana Project Web App** (themed as **Ayurami**) serves as the central administrative panel for managing products, users, and business metrics. Featuring a playful, responsive retro comic aesthetic (thick borders, vibrant color palettes, flat pop-art shadows), it provides store administrators and staff with a highly interactive panel to monitor sales growth, update inventory stocks, and manage account authorization, communicating seamlessly with the Go REST API.

---

## 🚀 Technologies Used

This project is built using modern, responsive, and robust frontend standards:

| Technology | Description |
| :--- | :--- |
| **Vue 3** | Core framework using the Composition API (`<script setup lang="ts">`) for performant and modular reactivity. |
| **TypeScript** | Strict typings for data contracts (Products, Users, Session) to ensure code correctness and safety. |
| **Tailwind CSS v3** | Utilized for utility-first styling, grid layouts, and custom theme overrides. |
| **Webpack & PostCSS** | Configured via Vue CLI for asset optimization, side-effect imports, and autoprefixing. |
| **Google Fonts** | Round, friendly typography integrating **Outfit** and **Nunito** for a polished comic look. |

---

## 💻 Getting Started & Commands

To set up the project and run it locally, follow these steps:

### 1. Installation
Install the required development and runtime dependencies:
```bash
npm install
```

### 2. Run with Debugging (Recommended)
Spawns the local development server and automatically opens your browser in debug mode:

*   **Firefox Developer Edition (Default):**
    ```bash
    node launch.js
    ```
*   **Google Chrome:**
    ```bash
    node launch.js --chrome
    ```

### 3. Direct Dev Serve
Compiles and hot-reloads the application without opening browsers:
```bash
npm run serve
```
Once active, visit the local URL in your browser: **[http://localhost:8081/](http://localhost:8081/)**

### 4. Build for Production
Compiles and minifies the application assets for production deployment:
```bash
npm run build
```

### 5. Linting
Verify code styling and check for TypeScript or syntax issues:
```bash
npm run lint
```

---

## ⚙ VS Code Debug Configuration

The project contains a pre-configured `.vscode/launch.json` file. Go to the **Run & Debug** pane in VS Code (or press `F5`) and choose from the following options:

*   **Run Dev Server (npm run serve):** Starts the development compilation process within the VS Code integrated terminal.
*   **Launch Firefox Developer Edition:** Directly opens Firefox Dev Edition pointed at localhost with debugging linked.
*   **Attach to Firefox (Port 6000):** Hooks VS Code debugger to the Firefox instance spawned by `launch.js`.
*   **Launch Chrome:** Directly opens Google Chrome against the dev server url.
*   **Attach to Chrome (Port 9222):** Hooks VS Code debugger to the Chrome instance spawned by `launch.js --chrome`.

---

> **🇨🇴 Made in Envigado, Colombia**
> *Built with passion, retro styles, and lots of excellent coffee.*
