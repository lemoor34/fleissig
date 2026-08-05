# Fleissig conversion-focused homepage experiment

The original production application remains in `src/App.jsx`.

The current preview renders `src/AppV3.jsx`, which:

- uses a clean bathroom photo in the hero without text overlays;
- separates normal cleaning, moving cleaning, and garden enquiries;
- asks for photos or video only for moving cleaning and complex work;
- keeps hourly pricing as the primary model;
- preserves the original before/after proof images lower on the page.

## Rollback

To restore the old application, change `src/main.jsx` back to:

```jsx
import App from './App.jsx'
```

and render `<App />` instead of `<AppV3 />`.
