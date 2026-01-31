# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## 🧭 Tailwind CSS — Bonnes pratiques (rapide)

- **Utiliser les classes Tailwind uniquement dans le JSX/HTML.** Évitez d'appliquer directement `bg-*`, `text-*`, `border-*` (et les variantes avec `/` comme `bg-white/10`) dans les fichiers CSS globaux.
- **Dans les fichiers CSS globaux, utilisez des variables CSS** (par ex. `--glass-bg`, `--glass-alpha`, `--glass-border`) et des valeurs valides (`rgba(var(--glass-bg), var(--glass-alpha))`, `rgba(...)`, `hsla(...)`).
- **Ne pas utiliser `@apply` pour des utilitaires de couleur/opacity ni pour des utilitaires générés à la volée** (ex. `bg-white/10`, `backdrop-blur-md`). Préférez les propriétés CSS natives (`backdrop-filter: blur(...)`) ou des variables.

Exemple concis :

```css
:root {
  --glass-bg: 255 255 255;
  --glass-alpha: 0.08;
  --glass-border: rgba(255, 255, 255, 0.04);
}
.surface {
  background-color: rgba(var(--glass-bg), var(--glass-alpha));
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
}
```

Ces règles évitent les erreurs Tailwind lors du build et gardent le design (glassmorphism) intact.
