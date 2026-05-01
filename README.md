<!-- If you use Visual Studio Code, you can render the README.md locally: Ctrl+Shift+V -->
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/rbergua)
<a href="https://github.com/rbergua/boulderrides/commits">
  <img src="https://img.shields.io/github/last-commit/rbergua/boulderrides?style=flat&timezone=America%2FDenver&display_timestamp=committer" alt="GitHub last commit">
</a>

# Boulder Group Rides

An interactive map showing **cycling group rides in Boulder, Colorado**.
It aggregates **Strava club events** and displays upcoming rides by day. It also lists nearby **races and events** sourced from BikeReg.

![Boulder Group Rides demo](demo.gif)

## Live version

- **Primary site:** https://boulderrides.cc  
- **GitHub Pages:** https://rbergua.github.io/boulderrides/

## Features

- **7-day calendar** — Quickly see which days have scheduled rides; the first day with rides loads automatically
- **Interactive map** — Routes are drawn as color-coded polylines using [MapLibre GL JS](https://maplibre.org/) with MapTiler vector tiles and an automatic fallback to Stadia Maps
- **Metric/Imperial units** — Bottom-left "Metric" button switches between miles/feet ↔ km/meters; updates tooltips and mobile sheets instantly (imperial by default)
- **Paved vs unpaved surfaces** — Routes are drawn as solid lines on paved surfaces and dashed lines on unpaved surfaces
- **Start pin markers** — A colored pin marks the starting location of each ride
- **Desktop** — Hover over a route or its start pin to highlight it and dim the others to gray, showing the club name, ride title, start time, and whether the ride is women-only; click to open the Strava event in a new tab
- **Mobile** — Tap a route or its start pin to see its details in a bottom sheet; tap "View on Strava" to open the event; swipe the panel down (or tap the map background) to dismiss it and restore all routes
- **Auto-fit bounds** — The map zooms to fit all routes for the selected day
- **Races & Events** — Dedicated page listing upcoming races and events
- **Progressive Web App (PWA)** — Installable on Android and iOS home screens for a full-screen, app-like experience with custom splash screens for all device sizes

## Getting Started

### Prerequisites

No build tools required — this is a plain HTML/JS app. You just need a local HTTP server.

### Run Locally

```bash
# Using Python
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

> **Tip:** Hard refresh (`Ctrl+Shift+R` on Windows/Linux, `Cmd+Shift+R` on Mac) forces the browser to re-download all files instead of using cached versions.
 
> **Tip:** To emulate a mobile device, open browser DevTools (`F12`) and toggle the device toolbar.

## Ride Data Format

Ride data is automatically fetched from the Strava API by a backend process that runs twice a day (12 PM & 1 AM) and keeps `club_rides.json` up to date. Each entry in the array represents one ride:

```json
[
  {
    "club_id": 575042,
    "club_name": "Rapha Boulder",
    "title": "Social Ride",
    "date": "2026-03-08 10:00",
    "url": "https://example.com/ride",
    "starting_location": [
      40.016888,
      -105.285529
    ],
    "women_only": false,
    "route_id": 3471700207861648642,
    "distance": 24.8,
    "elevation_gain": 1247,
    "route": [
      [
        40.01962,
        -105.27153,
        "paved"
      ],
      [
        40.0195,
        -105.27212,
        "unpaved"
      ],
      ...
    ]
  }
]
```

| Field | Type | Description |
|---|---|---|
| `club_id` | number | Strava club ID |
| `club_name` | string | Name of the organizing club |
| `title` | string | Ride name |
| `date` | string | `"YYYY-MM-DD HH:MM"` in 24-hour format; displayed as 12-hour (AM/PM) in the frontend |
| `url` | string | Link to the Strava ride event |
| `women_only` | boolean | If `true`, shown in the description |
| `starting_location` | `[lat, lng]` | Start marker position (optional; if not available, it uses the first point in `route`) |
| `route_id` | number | Strava route ID |
| `distance` | number | Route distance in miles (1 decimal); `null` if unavailable |
| `elevation_gain` | number | Total elevation gain in feet (integer); `null` if unavailable |
| `route` | `[[lat, lng, surface], ...]` | Array of latitude and longitude coordinates defining the route; each point includes a surface tag (`"paved"` or `"unpaved"`), or `null` if the OpenStreetMap surface classification failed |

## Race and Events Data Format

Race and event data is stored in `races.json`. Data is refreshed weekly from the BikeReg API (Mondays at 3 AM). Some major events not listed on BikeReg (e.g., Triple Bypass, Mt. Blue Sky Hill Climb) are hardcoded in the backend. Each entry in the array represents one race or event:

```json
[
  {
    "name": "Koppenberg Road Race",
    "url": "http://www.withoutlimits.co",
    "reg_link": "http://www.BikeReg.com/73713",
    "location": "Superior",
    "latitude": 39.9527634,
    "longitude": -105.1685977,
    "type": ["Road Race", "American Cycling Association"],
    "date": "2026-05-03"
  },
  {
    "name": "Superville Stage Race",
    "url": "http://www.withoutlimits.co",
    "reg_link": "http://www.BikeReg.com/74224",
    "location": "Superior",
    "latitude": 39.9083424,
    "longitude": -105.1699298,
    "type": ["Road Race"],
    "date": ["2026-05-16", "2026-05-17"]
  }
]
```

| Field | Type | Description |
|---|---|---|
| `name` | string | Display name of the race or event |
| `url` | string | Event website URL |
| `reg_link` | string | Registration link (typically a BikeReg URL) |
| `location` | string | City or town where the event takes place |
| `latitude` | number | Latitude of the event location |
| `longitude` | number | Longitude of the event location |
| `type` | array of strings | One or more event type tags (e.g. `"Road Race"`, `"Criterium"`, `"Time Trial"`, `"Mountain Bike"`, `"Special Event"`) and/or sanctioning body (e.g. `"American Cycling Association"`, `"Colorado Bicycle Racing Association (CBRA)"`) |
| `date` | string or array of strings | Event date in `YYYY-MM-DD` format; use a plain string for single-day events, or an array of strings for multi-day events (e.g. a stage race) |

## Project Structure

```
├── index.html        # Main app (map + calendar)
└── club_rides.json   # Ride data, auto-updated by the backend process (Strava API). The file is only committed when its contents change
└── races.json        # Race and event data, auto-updated by the backend process (BikeReg API). Major events not on BikeReg are hardcoded
```

## Customization

- **Days shown** — Change the `7` in `generateCalendar()` to show more or fewer days. Note that a longer window of time could be misleading. Recurring weekly rides only appear once their previous occurrence has passed, so looking further ahead would result in missing entries
- **Default map center** — Update `defaultCenter` in `index.html` (currently set to downtown Boulder)
- **Default zoom** — Update `defaultZoom` (currently `12`)
- **Route colors** — Edit the `colors` palette array in `index.html` to change the cycle of colors assigned to routes
- **Map tiles** — The app loads Stadia Maps immediately (no key required) so the map is instantly visible, then silently upgrades to MapTiler (outdoor/terrain) if the key is valid and quota is available. The MapTiler API key is locked to requests from `boulderrides.cc`

## Built With

- [MapLibre GL JS](https://maplibre.org/) — Interactive maps with vector tile rendering
- [MapTiler](https://www.maptiler.com/) — Outdoor/terrain map tiles (primary)
- [Stadia Maps](https://stadiamaps.com/) — Outdoor/terrain vector map tiles (fallback if MapTiler quota is exceeded or unavailable). Free, no API key required
- [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) — Extends MapTiler tile cache from the deault 8 hours to 120 days, saving API requests and making the map load faster for returning visitors (tiles served from disk instead of the network)
- [OpenStreetMap](https://www.openstreetmap.org/) — Road surface data source used for paved/unpaved classification, queried via the [Overpass API](https://overpass-api.de/) by the backend
- [Strava API](https://developers.strava.com/) — Source of group ride data, fetched by the backend
- [BikeReg API](https://www.bikereg.com/) — Source of race and event data, fetched by the backend
- [GoatCounter](https://www.goatcounter.com/) — Privacy-friendly analytics

## Support

If you find this project useful, you can also buy me a coffee (donate a small amount) with the link below:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/rbergua)