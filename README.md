# Power Rank by Smurfist

Interactive esports power-ranking creator. Pick 12 teams, rank them 1–12, share your list as text or a branded image.

**Live:** https://powerrank.smurfist.gg

## Stack
Pure HTML / CSS / vanilla JS. No build step. Hosted on GitHub Pages.

## Local development
Just open `index.html` in a browser, or run a local server:
```
python3 -m http.server 8000
```

## Updating team data
Teams, rosters and coaches are defined in [`script.js`](script.js) in the `TEAMS` array.
Team logos live in [`assets/teams/`](assets/teams/) as `{tag}.png` (e.g. `lev.png`).
