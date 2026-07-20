# Data Branch
 
This branch holds the JSON data files consumed by the frontend.
 
## Files
 
| File | Description |
|------|-------------|
| `weather.json` | Weather forecast for Boulder, CO fetched from the National Weather Service |
| `club_rides.json` | Upcoming club rides (latitude, longitude, surface) fetched from Strava and Ride With GPS (used by `main`) |
| `gpx_rides.json` | Upcoming club rides (latitude, longitude, altitude) fetched from Strava and Ride With GPS (used by `main/gpx`) |
| `races.json` | Upcoming races fetched from BikeReg |

Each file is only staged and committed if its fetched content has actually changed.

## How it works
 
A backend process running on a server fetches fresh data and pushes updates to this branch. The backend commits **by amending the last commit** (`git commit --amend`) rather than adding a new one, so routine data updates never add new commits to the branch. This keeps the repository from growing in size over time.
Manual edits to files on this branch (such as this README) are made as normal commits.
 
## Branches
 
| Branch | Purpose |
|--------|---------|
| `main` | Website source code (HTML, JS, CSS) |
| `data` | JSON data files only (this branch) |
 
The backend process only interacts with the `data` branch and has no access to `main`.
