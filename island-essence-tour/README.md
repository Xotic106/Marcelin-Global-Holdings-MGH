# Island Essence DMC — A Living Creole Experience

An interactive itinerary website for the one-day cultural discovery tour of Mahé.
Guests follow a tilted 3D relief map of the island: an arrow travels each leg of
the day, and the pathway lights up as each destination is reached. A side panel
(or bottom sheet on phones) shows the time, description, photos and — at lunch —
the Creole menu for each stop.

The map is illustrative, not GPS-accurate.

## Run it

It's a static site with no build step. Open `index.html` directly, or serve the folder:

```bash
cd island-essence-tour
python3 -m http.server 8000   # then visit http://localhost:8000
```

It can be hosted on any static host (GitHub Pages, Netlify, Vercel…).
Add `#stop-3` to the URL to open directly at a given stop (0–7).

## Editing content

All itinerary text, times, photos, the lunch menu and the full programme live at
the top of `js/tour.js` (`STOPS`, `LEGS`, `MENU`, `SCHEDULE`).

- **Photos** go in `assets/img/` and are referenced by file name in `STOPS[].photos`.
- **Map positions** are `x`/`y` in board units (the map is 1000 × 1200).
  Route shapes are SVG path strings in `LEGS[].d`.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Page structure |
| `css/style.css` | Styles, including the responsive layout |
| `js/tour.js` | Itinerary data and the map/camera/arrow engine |
| `assets/map-terrain.jpg` | Pre-rendered relief map |
| `tools/terrain.svg` | Source artwork for the relief map |
| `tools/render-terrain.js` | Re-renders the map image (`node tools/render-terrain.js`, needs Playwright) |
