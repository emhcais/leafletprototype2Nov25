# European Captives in the Mediterranean — Map v2

An accessible Leaflet historical atlas built from **3,137 source records**. The interface is designed for readers who know archival and printed maps better than GIS software.

## What changed in v2

- Simpler hybrid historical/modern visual design with larger controls
- All documented origins and captivity locations visible by default
- Clear filters for **Both**, **Places of Captivity**, and **Places of Origin**
- Century-first date filtering, with an optional custom range
- Search across names, places, sources, dates, and record IDs
- Complete searchable catalogue, including records with no map position
- Concise record display: name, origin, captivity place, date, source, date note, convert, and record ID
- Four-step introductory guide, permanent Help button, and printable guide
- English/international and Arabic/local-label basemap choices
- One public download: the complete CSV
- Advanced connection lines that are explicitly described as associations, not travel routes
- No artificial Strait of Gibraltar markers for unknown captivity locations

## Data results

| Measure | Result |
|---|---:|
| Source rows preserved in catalogue and CSV | 3,137 |
| Records with documented origin labels | 1,038 |
| Origins currently mapped | 1,001 |
| Named origins retained but not confidently mapped | 37 |
| Records with mapped captivity places | 2,325 |
| Records with unknown captivity places | 812 |
| Records with both locations mapped | 924 |
| Aggregated map locations | 78 |
| Aggregated origin–captivity connections | 71 |
| Tripoli records corrected from spreadsheet errors | 66 |
| Strait placeholder coordinates removed | 812 |
| Three-digit years corrected for filtering | 6 |

The original source file remains at `data/source-original.csv`. The browser uses `records.json`, `locations.geojson`, and `connections.geojson`. Visitors see only the complete CSV download in the interface.

## GitHub Pages

Place the **contents of this folder** at the repository root so that `index.html`, `css/`, `js/`, `data/`, and `docs/` are visible on the repository’s main page. See [GITHUB-NEXT-STEPS.md](GITHUB-NEXT-STEPS.md) for a browser-only publishing checklist.

## Rebuild the data

The application itself requires no Python for visitors. A reproducible preparation script is included for maintainers:

```bash
python3 scripts/prepare_data.py "BC Project Captivity Complete Location Date.csv" .
```

## Important limitations

- The Arabic/local basemap uses modern OpenStreetMap labels; it is not a reconstruction of early modern Arabic place naming.
- A genuine historical basemap is intentionally not included yet. It requires a selected source map, rights confirmation, georeferencing, and attribution.
- Seven origin labels covering 37 records remain named but unmapped: `St. Martin's`, `St. Fillo`, `Apson`, `Low`, `Warom`, `Feloe`, and `St.Urbes`.
- Several mapped origins are explicitly marked medium or low certainty in `data/origin-crosswalk.csv` and should be reviewed against the cited sources.
- January 1 dates are treated as year-only placeholders for filtering, following the pattern found in the dataset.
- Every source row is preserved, including exact duplicates. Record IDs identify source rows rather than deduplicated people.

## Files

- `index.html` — application shell
- `css/style.css` — accessible historical-atlas styling
- `js/app.js` — map, search, catalogue, filters, records, and guide
- `data/european-captives-complete.csv` — complete public download
- `data/origin-crosswalk.csv` — reviewed location interpretations and certainty
- `data/build-report.json` — machine-readable reconciliation summary
- `docs/quick-guide.html` — printable visitor guide
- `docs/METHODOLOGY.md` — historical and data methodology
- `docs/SPECIFICATION-V2.md` — implemented functional specification
- `scripts/prepare_data.py` — reproducible data builder

## Credits and third-party services

The application uses Leaflet 1.9.4 from unpkg. Basemap tiles are supplied by CARTO/OpenStreetMap and OpenStreetMap under their respective attribution requirements. Captive records remain the project’s research data.
