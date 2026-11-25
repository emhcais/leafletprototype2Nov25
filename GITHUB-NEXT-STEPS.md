# GitHub next steps for Map v2

These steps can be completed entirely in the GitHub website.

## 1. Preserve the current published version

Before replacing files, create a release or branch for the current prototype if you want to keep an easy rollback point. At minimum, note the current commit under **Code → Commits**.

## 2. Upload Map v2 to the repository root

1. Open the `mediterranean-captivity` repository.
2. Choose **Add file → Upload files**.
3. Drag in the **contents** of `european-captives-map-v2`, not the outer folder.
4. Confirm that `index.html` is at the repository root.
5. Confirm that these folders are present: `css`, `js`, `data`, `docs`, and `scripts`.
6. Commit with a clear message such as: `Publish accessible European Captives map v2`.

If GitHub asks whether to replace files with the same names, replace them. Remove obsolete prototype files only after the new page has been tested.

## 3. Let GitHub Pages redeploy

If Pages is already configured for `main` and `/ (root)`, no setting change should be needed.

1. Open **Actions**.
2. Wait for the Pages deployment to show a green check.
3. Open **Settings → Pages → Visit site**.
4. Hard-refresh the published page (`Ctrl+F5` on Windows or `Cmd+Shift+R` on Mac).

## 4. Run the publication checklist

- The page opens without a file listing.
- The introductory guide appears on first visit.
- English/international and Arabic/local-label maps both load.
- The default view shows both origins and captivity locations.
- Origin-only and captivity-only filters change the markers.
- Sixteenth-, seventeenth-, and eighteenth-century filters change counts.
- Search finds a known captive and a record with no mapped location.
- “View all captive records” reports 3,137 records with filters cleared.
- A record shows only the eight requested fields.
- The CSV download opens and contains 3,137 data rows.
- No cluster appears in the Strait of Gibraltar for unknown captivity places.
- Tripoli appears correctly.
- The layout remains usable at 200% browser zoom and on a phone/tablet.

## 5. Review these scholarly items before calling v2 final

1. **Unresolved origin labels:** review `St. Martin's`, `St. Fillo`, `Apson`, `Low`, `Warom`, `Feloe`, and `St.Urbes` (37 records total).
2. **Low-certainty interpretations:** review the entries marked `low` in `data/origin-crosswalk.csv`, especially Gallipoli, North Yarmouth, Boston, Lyn, Hampton, Foulston, Stockton, and St. Martin Parish.
3. **Date rules:** confirm that January 1 values are year-only placeholders and approve the six 617/624 corrections.
4. **Source display:** spot-check long citations in the concise record panel.
5. **Exact duplicates:** decide whether duplicate source rows should remain visible or be flagged in a later release. This build preserves every row.

## 6. Add the historical basemap as a separate milestone

Do not label a sepia modern map as historical. Select one map only after:

- confirming public-domain or licensed use;
- documenting title, cartographer, date, institution, and stable source URL;
- georeferencing the image and checking Mediterranean alignment;
- preparing tile delivery that GitHub Pages can serve efficiently;
- adding complete attribution and a warning about distortions.

Until then, the disabled selector communicates that the feature is planned rather than pretending a modern basemap is historical.

## 7. Continue the project

Recommended order after the European map is approved:

1. Publish a tagged release such as `v2.0-european-review`.
2. Add a short project About page and data citation/license.
3. Test the GitHub Pages URL inside WordPress.com; use a link if iframe embedding is unavailable.
4. Prepare the North African dataset with the same fields and uncertainty rules.
5. Reuse the interface for the North African map.
6. Build the comparative Mediterranean view only after both individual maps pass review.
