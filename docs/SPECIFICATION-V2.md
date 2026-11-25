# European Captives Interactive Map — Implemented Specification v2.0

## Purpose

Create a digital historical atlas for nontechnical readers while preserving the complete research collection and making uncertainty visible.

## Implemented requirements

### Audience and visual style

- Hybrid historical/modern appearance
- Large, plain-language controls
- High contrast and responsive layout
- Keyboard-focus indicators and 200% zoom support
- No GIS terminology required

### Default view

- Both documented origins and captivity locations
- Location-level aggregated markers rather than thousands of overlapping points
- Permanent symbol legend
- Mediterranean starting extent

### Map appearance

- English/international modern basemap
- Arabic/local-label modern basemap
- Historical-map selector shown as planned but disabled until rights and georeferencing review

### Filters

- Both / captivity / origin
- All dates / sixteenth / seventeenth / eighteenth century
- Custom year range
- Name, place, source, date, and record-ID search
- Optional documented connections in Advanced View

### Missing and uncertain locations

- No markers for unknown places
- Strait of Gibraltar placeholders removed from map data
- Known origin retained when captivity place is unknown
- Named but unresolved locations retained in the catalogue as `unmapped_named`
- Connection lines only when both endpoints are mapped

### Catalogue

- Every source row is included
- Filters for known/unknown origins and captivity places
- Filter for named but unresolved locations
- Location-specific catalogue view from each marker
- Pagination for readability

### Individual record display

Displayed in this order:

1. Name
2. Place of origin
3. Place of captivity
4. Date
5. Source
6. Date note
7. Convert
8. Record ID

Coordinates and additional database fields do not appear in the panel.

### Help and downloads

- Four-step first-visit guide
- Permanent help button
- Printable one-page guide
- Single public CSV download containing the complete dataset
- GeoJSON remains an application dependency but is not advertised as a visitor download

### Summary counts

The interface calculates total records, documented origins, documented captivity places, unknown captivity places, and current-filter matches from the loaded record data.

## Acceptance status

The build is ready for GitHub Pages review when its structural tests pass. Final scholarly approval still requires review of unresolved and low-certainty origin interpretations, the January 1 date convention, source display, and the future historical basemap.
