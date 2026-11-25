# Methodology

## What the map represents

The map visualizes geographical information documented in the supplied European Captives dataset. A marker records an association between a source row and a place. It does not by itself establish birthplace, capture site, route, duration, or final destination.

Connection lines are straight visual links between a documented origin and a documented place of captivity. They are not reconstructed routes.

## Complete records versus mappable records

All 3,137 source rows remain available in the catalogue and complete CSV. Mapping is conditional:

- Known origin + known captivity place: both locations may appear, with an optional connection.
- Known origin + unknown captivity place: the origin appears; there is no invented endpoint.
- Unknown origin + known captivity place: the captivity place appears.
- Both unknown: the record remains searchable but receives no marker.
- Named but unresolved place: the name remains visible in the record and is classified as `unmapped_named`.

## Strait of Gibraltar placeholder

The original spreadsheet assigned `35.9982, -5.6879` to 812 records whose place of captivity was `n/a`. This build treats those coordinates as a data-entry placeholder, removes them from the mapping layer, and preserves each source row in the catalogue and CSV.

## Dates

The map filters by year. Values entered as `01/01/YYYY` are treated as year-only placeholders because of their frequency and pattern. Day-level dates retain their displayed value. Six apparent three-digit years (`617` and `624`) are filtered as 1617 and 1624 because the four-digit year is written in the corresponding captive-name text. The original date text is preserved.

## Places and uncertainty

Captivity locations use a small reviewed crosswalk. Tripoli coordinates replace spreadsheet `#FIELD!` errors. Origins use a separate crosswalk with `high`, `medium`, `low`, or `unresolved` certainty. Representative regional points are labeled as such. The full review table is `data/origin-crosswalk.csv`.

Unresolved names are not positioned merely to make the map look complete.

## Record identity

`Record ID` values (`EC000001` onward) identify source rows. They do not assert that every row is a unique person. Group descriptions, crews, repeat names, and exact duplicate rows remain part of the source dataset.

## Concise public record

The public record panel shows only:

1. Name
2. Place of origin
3. Place of captivity
4. Date
5. Source
6. Date note
7. Convert
8. Record ID

Coordinates and additional spreadsheet fields do not appear in the panel. The complete CSV preserves the underlying fields and derived mapping metadata.

## Basemaps

The English/international and Arabic/local-label options use modern web basemaps. They do not reproduce early modern political boundaries or historical toponyms. A historical layer should be added only after source selection, rights review, georeferencing, and attribution.
