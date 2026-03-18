<!-- If you use Visual Studio Code, you can render the README.md locally by pressing: Ctrl+Shift+V -->
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/rbergua)
<img src="https://img.shields.io/github/last-commit/rbergua/boulderrides?style=flat" alt="GitHub last commit">

# Boulder Group Rides

An interactive map showing **cycling group rides in Boulder, Colorado**.  
It aggregates **Strava club events** and displays upcoming rides by day.

![Boulder Group Rides demo](demo.gif)

## Live version

- **Primary site:** https://boulderrides.cc  
- **GitHub Pages:** https://rbergua.github.io/boulderrides/

## Features

- **7-day calendar** — Quickly see which days have scheduled rides; the first day with rides loads automatically
- **Interactive map** — Routes are drawn as color-coded polylines using [Leaflet.js](https://leafletjs.com/) and OpenStreetMap tiles
- **Desktop** — Hover over a route to see club name, ride title, start time, and whether the ride is women-only; click to open the Strava event in a new tab
- **Mobile** — Tap a route to see its details in a panel at the bottom; tap "Open in Strava" to view the event; swipe the panel down to dismiss it
- **Auto-fit bounds** — The map zooms to fit all routes for the selected day

## Getting Started

### Prerequisites

No build tools required — this is a plain HTML/JS app. You just need a local HTTP server.

### Run Locally

```bash
# Using Python
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Data Format

Ride data is automatically fetched from the Strava API by a backend process that runs continuously and keeps `club_rides.json` up to date. Each entry in the array represents one ride:

```json
[
  {
    "club_name": "Rapha Boulder",
    "title": "Social Ride",
    "date": "2026-03-08 10:00",
    "url": "https://example.com/ride",
    "women_only": false,
    "starting_location": [40.0150, -105.2705],
    "route": [
      [40.0150, -105.2705],
      [40.0200, -105.2600],
      ...
    ]
  }
]
```

| Field | Type | Description |
|---|---|---|
| `club_name` | string | Name of the organizing club |
| `title` | string | Ride name |
| `date` | string | `"YYYY-MM-DD HH:MM"` format |
| `url` | string | Link to the Strava ride event |
| `women_only` | boolean | If `true`, shown in the description |
| `starting_location` | `[lat, lng]` | Start marker position (optional; if not available, it uses the first point in `route`) |
| `route` | `[[lat, lng], ...]` | Array of latitude and longitude coordinates defining the route |

## Project Structure

```
├── index.html        # Main app (map + calendar)
└── club_rides.json   # Ride data, auto-updated by the backend process (Strava API). The file is only committed when its contents change
```

## Customization

- **Days shown** — Change the `7` in `generateCalendar()` to show more or fewer days
- **Default map center** — Update `defaultCenter` in `index.html` (currently set to downtown Boulder)
- **Default zoom** — Update `defaultZoom` (currently `14`)
- **Route colors** — Edit the `colors` palette array in `index.html` to change the cycle of colors assigned to routes

## Built With

- [Leaflet.js](https://leafletjs.com/) — Interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) — Map tiles
- [Strava API](https://developers.strava.com/) — Source of group ride data, fetched by the backend

## Support

If you find this project useful, you can also buy me a coffee (donate a small amount) with the link below:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/rbergua)
