# M365 Message Centre Review

A lightweight, single-page web app for reviewing Microsoft 365 Message Centre announcements and Roadmap entries — filtered to the products that matter most.

Data is sourced live from [mc.merill.net](https://mc.merill.net), a public archive of Microsoft 365 Message Centre and Roadmap posts.

---

## Pages

### 📋 Message Centre (`index.html`)
Displays recent MC announcements filtered to your tracked products. Default view shows the last 7 days.

### 🗺 Roadmap (`roadmap.html`)
Displays Roadmap entries (RM items) with delivery status, progress indicators, and links to the official Microsoft 365 Roadmap. Default view shows the last 30 days.

---

## Tracked Products

| Product | Keywords matched |
|---|---|
| Copilot | Microsoft 365 Copilot, Copilot Chat |
| Copilot Studio | Copilot Studio |
| Power Platform | Power Platform |
| Power Apps | Power Apps, PowerApps |
| Power Automate | Power Automate |
| Dynamics 365 Sales | Dynamics 365 Sales, Copilot for Sales |
| Business Central | Business Central, Dynamics 365 Business Central |

---

## Features

- **On-demand refresh** — fetches the latest data from mc.merill.net whenever you click Refresh
- **Product filter tabs** — click any product to narrow the view, or leave on All for grouped sections
- **Date range selector** — 7 days / 14 days / 30 days / 90 days / All time
- **Live search** — filters by title, summary, or MC/RM number as you type, with highlighted matches
- **Status filter** (Roadmap page) — filter by Launched / Rolling out / Preview / In development / Cancelled
- **Progress timeline bar** (Roadmap page) — visual indicator of each item's delivery stage
- **Admin Center links** — each Message Centre card links directly to the entry in the Microsoft 365 Admin Center
- **Microsoft Roadmap links** — each Roadmap card links to the entry on microsoft.com/microsoft-365/roadmap

---

## Usage

Open `index.html` directly in a browser — no build step, no dependencies, no server required.

```
open index.html
```

Or serve locally with any static file server:

```bash
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000).

---

## How It Works

On load (and on every Refresh), the app fetches:

```
https://mc.merill.net/messages-index.json
```

This is a public JSON index maintained by [mc.merill.net](https://mc.merill.net) containing compact records for active Message Centre posts (`MC` prefix) and Roadmap items (`RM` prefix). All filtering, grouping, and rendering happens client-side in the browser — no backend required.

---

## Data Source

All data comes from **[mc.merill.net](https://mc.merill.net)** — an independent archive of Microsoft 365 Message Centre and Roadmap posts, designed for easy search, linking, and AI consumption.

> Message Centre posts are tenant-specific. Always verify applicability against your own tenant's Message Centre in the [Microsoft 365 Admin Center](https://admin.microsoft.com).

---

*Last updated: 9 June 2026*
