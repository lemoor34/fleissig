# Fleissig conversion-focused homepage experiment

This branch keeps the original `src/App.jsx` untouched and adds a separate `src/AppV2.jsx`.

## What changed

- Replaced the long catalogue-style homepage with a shorter conversion flow.
- Made WhatsApp the primary action throughout the page.
- Removed the customer-facing calculator and automatic fixed-price framing from the homepage.
- Made hourly cleaning prices the primary offer:
  - 1 employee: CHF 55/hour
  - 2-person team: CHF 100 per deployment hour
- Positioned moving cleaning as a price guarantee after photo/video review.
- Reduced the visible core services to residential cleaning, moving cleaning, and garden maintenance.
- Moved window, office, and construction cleaning into a small secondary enquiry link.
- Brought real before/after images near the top of the page.
- Reduced trust messaging to four clear points.
- Simplified mobile navigation and added a floating WhatsApp action.

## Rollback

The old application remains in `src/App.jsx`.

To restore it, change `src/main.jsx` back to:

```jsx
import App from './App.jsx'
```

and render `<App />` instead of `<AppV2 />`.
