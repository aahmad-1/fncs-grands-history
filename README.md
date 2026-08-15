# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

```
fncs-grands-history
├─ .env
├─ data
│  └─ cleaned
│     ├─ C2S1
│     │  ├─ C2S1_AS.csv
│     │  ├─ C2S1_BR.csv
│     │  ├─ C2S1_EU.csv
│     │  ├─ C2S1_ME.csv
│     │  ├─ C2S1_NAE.csv
│     │  ├─ C2S1_NAW.csv
│     │  └─ C2S1_OCE.csv
│     ├─ C2S2
│     │  ├─ C2S2_AS.csv
│     │  ├─ C2S2_BR.csv
│     │  ├─ C2S2_EU.csv
│     │  ├─ C2S2_ME.csv
│     │  ├─ C2S2_NAE.csv
│     │  ├─ C2S2_NAW.csv
│     │  └─ C2S2_OCE.csv
│     ├─ C2S2_Invitationals
│     │  ├─ C2S2_Invitationals_AS.csv
│     │  ├─ C2S2_Invitationals_BR.csv
│     │  ├─ C2S2_Invitationals_EU.csv
│     │  ├─ C2S2_Invitationals_ME.csv
│     │  ├─ C2S2_Invitationals_NAE.csv
│     │  ├─ C2S2_Invitationals_NAW.csv
│     │  └─ C2S2_Invitationals_OCE.csv
│     ├─ C2S3
│     │  ├─ C2S3_AS.csv
│     │  ├─ C2S3_BR.csv
│     │  ├─ C2S3_EU.csv
│     │  ├─ C2S3_ME.csv
│     │  ├─ C2S3_NAE.csv
│     │  ├─ C2S3_NAW.csv
│     │  └─ C2S3_OCE.csv
│     ├─ C2S4
│     │  ├─ C2S4_AS.csv
│     │  ├─ C2S4_BR.csv
│     │  ├─ C2S4_EU.csv
│     │  ├─ C2S4_ME.csv
│     │  ├─ C2S4_NAE.csv
│     │  ├─ C2S4_NAW.csv
│     │  └─ C2S4_OCE.csv
│     ├─ C2S5
│     │  ├─ C2S5_AS.csv
│     │  ├─ C2S5_BR.csv
│     │  ├─ C2S5_EU.csv
│     │  ├─ C2S5_ME.csv
│     │  ├─ C2S5_NAE.csv
│     │  ├─ C2S5_NAW.csv
│     │  └─ C2S5_OCE.csv
│     ├─ C2S6
│     │  ├─ C2S6_AS.csv
│     │  ├─ C2S6_BR.csv
│     │  ├─ C2S6_EU.csv
│     │  ├─ C2S6_ME.csv
│     │  ├─ C2S6_NAE.csv
│     │  ├─ C2S6_NAW.csv
│     │  └─ C2S6_OCE.csv
│     ├─ C2S7
│     │  ├─ C2S7_AS.csv
│     │  ├─ C2S7_BR.csv
│     │  ├─ C2S7_EU.csv
│     │  ├─ C2S7_ME.csv
│     │  ├─ C2S7_NAE.csv
│     │  ├─ C2S7_NAW.csv
│     │  └─ C2S7_OCE.csv
│     ├─ C2S8
│     │  ├─ C2S8_AS.csv
│     │  ├─ C2S8_BR.csv
│     │  ├─ C2S8_EU.csv
│     │  ├─ C2S8_ME.csv
│     │  ├─ C2S8_NAE.csv
│     │  ├─ C2S8_NAW.csv
│     │  └─ C2S8_OCE.csv
│     ├─ C3S1
│     │  ├─ C3S1_AS.csv
│     │  ├─ C3S1_BR.csv
│     │  ├─ C3S1_EU.csv
│     │  ├─ C3S1_ME.csv
│     │  ├─ C3S1_NAE.csv
│     │  ├─ C3S1_NAW.csv
│     │  └─ C3S1_OCE.csv
│     ├─ C3S2
│     │  ├─ C3S2_AS.csv
│     │  ├─ C3S2_BR.csv
│     │  ├─ C3S2_EU.csv
│     │  ├─ C3S2_ME.csv
│     │  ├─ C3S2_NAE.csv
│     │  ├─ C3S2_NAW.csv
│     │  └─ C3S2_OCE.csv
│     ├─ C3S3
│     │  ├─ C3S3_AS.csv
│     │  ├─ C3S3_BR.csv
│     │  ├─ C3S3_EU.csv
│     │  ├─ C3S3_ME.csv
│     │  ├─ C3S3_NAE.csv
│     │  ├─ C3S3_NAW.csv
│     │  └─ C3S3_OCE.csv
│     ├─ C4M1
│     │  ├─ C4M1_AS.csv
│     │  ├─ C4M1_BR.csv
│     │  ├─ C4M1_EU.csv
│     │  ├─ C4M1_ME.csv
│     │  ├─ C4M1_NAE.csv
│     │  ├─ C4M1_NAW.csv
│     │  └─ C4M1_OCE.csv
│     ├─ C4M2
│     │  ├─ C4M2_AS.csv
│     │  ├─ C4M2_BR.csv
│     │  ├─ C4M2_EU.csv
│     │  ├─ C4M2_ME.csv
│     │  ├─ C4M2_NAC.csv
│     │  └─ C4M2_OCE.csv
│     ├─ C4M3
│     │  ├─ C4M3_AS.csv
│     │  ├─ C4M3_BR.csv
│     │  ├─ C4M3_EU.csv
│     │  ├─ C4M3_ME.csv
│     │  ├─ C4M3_NAC.csv
│     │  └─ C4M3_OCE.csv
│     ├─ C5M1
│     │  ├─ C5M1_AS.csv
│     │  ├─ C5M1_BR.csv
│     │  ├─ C5M1_EU.csv
│     │  ├─ C5M1_ME.csv
│     │  ├─ C5M1_NAC.csv
│     │  └─ C5M1_OCE.csv
│     ├─ C5M2
│     │  ├─ C5M2_AS.csv
│     │  ├─ C5M2_BR.csv
│     │  ├─ C5M2_EU.csv
│     │  ├─ C5M2_ME.csv
│     │  ├─ C5M2_NAC.csv
│     │  └─ C5M2_OCE.csv
│     ├─ C5M3
│     │  ├─ C5M3_AS.csv
│     │  ├─ C5M3_BR.csv
│     │  ├─ C5M3_EU.csv
│     │  ├─ C5M3_ME.csv
│     │  ├─ C5M3_NAC.csv
│     │  └─ C5M3_OCE.csv
│     ├─ C6M1
│     │  ├─ C6M1_AS.csv
│     │  ├─ C6M1_BR.csv
│     │  ├─ C6M1_EU.csv
│     │  ├─ C6M1_ME.csv
│     │  ├─ C6M1_NAC.csv
│     │  ├─ C6M1_NAW.csv
│     │  └─ C6M1_OCE.csv
│     ├─ C6M2
│     │  ├─ C6M2_AS.csv
│     │  ├─ C6M2_BR.csv
│     │  ├─ C6M2_EU.csv
│     │  ├─ C6M2_ME.csv
│     │  ├─ C6M2_NAC.csv
│     │  ├─ C6M2_NAW.csv
│     │  └─ C6M2_OCE.csv
│     ├─ C6M3
│     │  ├─ C6M3_AS.csv
│     │  ├─ C6M3_BR.csv
│     │  ├─ C6M3_EU.csv
│     │  ├─ C6M3_ME.csv
│     │  ├─ C6M3_NAC.csv
│     │  ├─ C6M3_NAW.csv
│     │  └─ C6M3_OCE.csv
│     ├─ C7M1
│     │  ├─ C7M1_AS.csv
│     │  ├─ C7M1_BR.csv
│     │  ├─ C7M1_EU.csv
│     │  ├─ C7M1_ME.csv
│     │  ├─ C7M1_NAC.csv
│     │  ├─ C7M1_NAW.csv
│     │  └─ C7M1_OCE.csv
│     ├─ C7M2
│     │  ├─ C7M2_AS.csv
│     │  ├─ C7M2_BR.csv
│     │  ├─ C7M2_EU.csv
│     │  ├─ C7M2_ME.csv
│     │  ├─ C7M2_NAC.csv
│     │  ├─ C7M2_NAW.csv
│     │  └─ C7M2_OCE.csv
│     ├─ Globals_2022
│     │  └─ Globals_2022.csv
│     ├─ Globals_2023
│     │  └─ Globals_2023.csv
│     ├─ Globals_2024
│     │  └─ Globals_2024.csv
│     ├─ Globals_2025
│     │  └─ Globals_2025.csv
│     ├─ Globals_C7M1_Summit
│     │  └─ Globals_C7M1_Summit.csv
│     ├─ Grand_Royale
│     │  ├─ Grand_Royale_AS.csv
│     │  ├─ Grand_Royale_BR.csv
│     │  ├─ Grand_Royale_EU.csv
│     │  ├─ Grand_Royale_ME.csv
│     │  ├─ Grand_Royale_NAE.csv
│     │  ├─ Grand_Royale_NAW.csv
│     │  └─ Grand_Royale_OCE.csv
│     ├─ Season_X
│     │  ├─ Season_X_AS.csv
│     │  ├─ Season_X_BR.csv
│     │  ├─ Season_X_EU.csv
│     │  ├─ Season_X_ME.csv
│     │  ├─ Season_X_NAE.csv
│     │  ├─ Season_X_NAW.csv
│     │  └─ Season_X_OCE.csv
│     └─ Solo_All_Star
│        ├─ Solo_All_Star_AS.csv
│        ├─ Solo_All_Star_BR.csv
│        ├─ Solo_All_Star_EU.csv
│        ├─ Solo_All_Star_ME.csv
│        ├─ Solo_All_Star_NAE.csv
│        ├─ Solo_All_Star_NAW.csv
│        └─ Solo_All_Star_OCE.csv
├─ database
│  ├─ load_data.py
│  └─ schema.sql
├─ eslint.config.js
├─ index.html
├─ notebooks
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.svg
│  └─ icons.svg
├─ README.md
├─ requirements.txt
├─ src
│  ├─ App.css
│  ├─ App.tsx
│  ├─ assets
│  │  ├─ hero.png
│  │  ├─ react.svg
│  │  └─ vite.svg
│  ├─ config.py
│  ├─ index.css
│  ├─ main.py
│  ├─ main.tsx
│  ├─ parser.py
│  ├─ scraper.py
│  ├─ tempCodeRunnerFile.py
│  ├─ utils.py
│  └─ __pycache__
│     ├─ config.cpython-313.pyc
│     ├─ parser.cpython-313.pyc
│     ├─ scraper.cpython-313.pyc
│     └─ utils.cpython-313.pyc
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```