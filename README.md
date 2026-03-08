# Boulder Group Rides

An interactive map showing local cycling club group rides in the Boulder, CO area. Browse upcoming rides by day, view routes on a map, and click to see event details and join.

![Boulder Group Rides demo](demo.gif)

## Features

- **7-day calendar** — Quickly see which days have scheduled rides; the first day with rides loads automatically
- **Interactive map** — Routes are drawn as color-coded polylines using [Leaflet.js](https://leafletjs.com/) and OpenStreetMap tiles
- **Desktop** — Hover over a route to see club name, ride title, start time, and whether the ride is women-only; click to open the Strava event in a new tab
- **Mobile** — Tap a route to see the ride details; tap again to open the Strava event
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

## Live version

[https://rbergua.github.io/Boulderrides/](https://rbergua.github.io/Boulderrides/)

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
└── club_rides.json   # Ride data, auto-updated by the backend process (Strava API)
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