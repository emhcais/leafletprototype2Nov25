(() => {
  "use strict";

  const state = {
    records: [],
    locations: null,
    connections: null,
    mode: "both",
    period: "all",
    from: 1500,
    to: 1800,
    query: "",
    catalogueFilter: "all",
    locationFilter: null,
    page: 1,
    pageSize: 30,
    showConnections: false,
    helpStep: 0,
  };

  const el = (id) => document.getElementById(id);
  const number = new Intl.NumberFormat("en-US");
  let map;
  let markerLayer;
  let connectionLayer;
  let activeBaseLayer;
  let recordsById = new Map();

  const baseLayers = {
    english: {
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      options: { subdomains: "abcd", maxZoom: 19, attribution: "© OpenStreetMap contributors © CARTO" },
      note: "A clear modern basemap with international labels. Historical place names remain in the records.",
    },
    arabic: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: { maxZoom: 19, attribution: "© OpenStreetMap contributors" },
      note: "OpenStreetMap uses locally supplied labels, including Arabic labels across much of North Africa. These are modern labels, not reconstructed historical names.",
    },
  };

  const helpSteps = [
    { title: "Explore the Mediterranean", body: "Click a numbered marker to see the documented records associated with that place. The map key distinguishes origins, places of captivity, and locations that contain both." },
    { title: "Find an individual", body: "Use the search box for a captive’s name, a place, a source, or a record ID. Search also finds people who have no mappable location." },
    { title: "Change what you see", body: "Choose origins, places of captivity, or both. Select a century for a simple historical view; use the custom range only when you need it." },
    { title: "Open the complete catalogue", body: "Choose “View all captive records” to browse every source row, including records with unknown or unresolved locations. Select a name for a short archival-style entry." },
  ];

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
  }

  function normalize(value) {
    return String(value ?? "").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function debounce(fn, delay = 220) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function passesPeriod(record) {
    if (state.period === "all") return true;
    if (!Number.isFinite(record.year)) return false;
    if (state.period === "custom") return record.year >= state.from && record.year <= state.to;
    const start = Number(state.period);
    return record.year >= start && record.year <= start + 99;
  }

  function passesSearch(record) {
    if (!state.query) return true;
    const haystack = normalize([
      record.id,
      record.name,
      record.place_of_origin,
      record.origin_standard,
      record.place_of_captivity,
      record.source,
      record.date,
    ].join(" "));
    return haystack.includes(normalize(state.query));
  }

  function baseFilteredRecords() {
    return state.records.filter((record) => passesPeriod(record) && passesSearch(record));
  }

  function mapModeRecords(records) {
    if (state.mode === "origin") return records.filter((r) => r.origin_status !== "unknown");
    if (state.mode === "captivity") return records.filter((r) => r.captivity_status !== "unknown");
    return records;
  }

  function catalogueRecords() {
    let records = baseFilteredRecords();
    const filter = state.catalogueFilter;
    if (filter === "known-captivity") records = records.filter((r) => r.captivity_status !== "unknown");
    if (filter === "unknown-captivity") records = records.filter((r) => r.captivity_status === "unknown");
    if (filter === "known-origin") records = records.filter((r) => r.origin_status !== "unknown");
    if (filter === "unknown-origin") records = records.filter((r) => r.origin_status === "unknown");
    if (filter === "unmapped") records = records.filter((r) => r.origin_status === "unmapped_named" || r.captivity_status === "unmapped_named");
    if (state.locationFilter) {
      records = records.filter((r) => r.origin_location_key === state.locationFilter || r.captivity_location_key === state.locationFilter);
    }
    return records;
  }

  function updateSummary(filtered) {
    const all = state.records;
    el("total-records").textContent = number.format(all.length);
    el("known-origins").textContent = number.format(all.filter((r) => r.origin_status !== "unknown").length);
    el("known-captivity").textContent = number.format(all.filter((r) => r.captivity_status !== "unknown").length);
    el("unknown-captivity").textContent = number.format(all.filter((r) => r.captivity_status === "unknown").length);
    el("matching-records").textContent = number.format(mapModeRecords(filtered).length);
  }

  function locationKey(feature) {
    const [lon, lat] = feature.geometry.coordinates;
    return `${lat.toFixed(4)},${lon.toFixed(4)}`;
  }

  function activeIds(ids, allowed) {
    return ids.filter((id) => allowed.has(id));
  }

  function markerIcon(kind, count) {
    return L.divIcon({
      className: "",
      html: `<div class="location-marker ${kind}"><span>${count > 999 ? "999+" : number.format(count)}</span></div>`,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -23],
    });
  }

  function renderMap(filtered) {
    markerLayer.clearLayers();
    connectionLayer.clearLayers();
    const allowed = new Set(filtered.map((r) => r.id));
    let markerCount = 0;

    for (const feature of state.locations.features) {
      const p = feature.properties;
      const origins = activeIds(p.origin_record_ids, allowed);
      const captivity = activeIds(p.captivity_record_ids, allowed);
      let shownOrigins = origins;
      let shownCaptivity = captivity;
      if (state.mode === "origin") shownCaptivity = [];
      if (state.mode === "captivity") shownOrigins = [];
      const total = shownOrigins.length + shownCaptivity.length;
      if (!total) continue;
      const kind = shownOrigins.length && shownCaptivity.length ? "both" : (shownOrigins.length ? "origin" : "captivity");
      const [lon, lat] = feature.geometry.coordinates;
      const marker = L.marker([lat, lon], {
        icon: markerIcon(kind, total),
        title: `${p.name}: ${number.format(total)} matching records`,
        alt: `${p.name}: ${number.format(total)} matching records`,
        keyboard: true,
      });
      marker.on("click", () => showLocation(feature, shownOrigins, shownCaptivity));
      marker.addTo(markerLayer);
      markerCount += 1;
    }

    if (state.showConnections && state.mode === "both") {
      for (const feature of state.connections.features) {
        const ids = activeIds(feature.properties.record_ids, allowed);
        if (!ids.length) continue;
        const line = L.geoJSON(feature, {
          style: {
            color: "#5c4d60",
            opacity: 0.55,
            weight: Math.min(9, 1.5 + Math.log2(ids.length + 1)),
            dashArray: "6 5",
          },
        });
        line.bindTooltip(`${escapeHtml(feature.properties.origin)} → ${escapeHtml(feature.properties.captivity)}: ${number.format(ids.length)} record${ids.length === 1 ? "" : "s"}`);
        line.addTo(connectionLayer);
      }
    }
    el("map-status").textContent = `${markerCount} mapped locations match the current filters.`;
  }

  function renderAll() {
    const filtered = baseFilteredRecords();
    updateSummary(filtered);
    renderMap(filtered);
    if (el("catalogue-dialog").open) renderCatalogue();
  }

  function showLocation(feature, originIds, captivityIds) {
    const p = feature.properties;
    const ids = Array.from(new Set([...originIds, ...captivityIds]));
    const samples = ids.slice(0, 20).map((id) => {
      const r = recordsById.get(id);
      return `<button class="record-button" type="button" data-record-id="${escapeHtml(id)}"><strong>${escapeHtml(r.name)}</strong><br><small>${escapeHtml(r.date)} · ${escapeHtml(r.id)}</small></button>`;
    }).join("");
    const key = locationKey(feature);
    el("detail-content").innerHTML = `
      <p class="eyebrow" style="color:#7a493d">Selected location</p>
      <h2>${escapeHtml(p.name)}</h2>
      <p><span class="certainty">${escapeHtml(p.certainty)} geographic certainty</span></p>
      <p>${escapeHtml(p.mapping_note)}</p>
      <dl class="record-fields">
        <dt>Origins</dt><dd>${number.format(originIds.length)} matching record${originIds.length === 1 ? "" : "s"}</dd>
        <dt>Captivity</dt><dd>${number.format(captivityIds.length)} matching record${captivityIds.length === 1 ? "" : "s"}</dd>
      </dl>
      <h3>Names at this location</h3>
      ${samples || "<p>No names match the current filters.</p>"}
      ${ids.length > 20 ? `<p>Showing 20 of ${number.format(ids.length)} records.</p>` : ""}
      <button class="button" type="button" data-open-location="${escapeHtml(key)}">Browse all records at this location</button>`;
    el("detail-panel").hidden = false;
    el("detail-panel").scrollTop = 0;
  }

  function showRecord(recordId) {
    const r = recordsById.get(recordId);
    if (!r) return;
    const fields = [
      ["Place of origin", r.place_of_origin],
      ["Place of captivity", r.place_of_captivity],
      ["Date", r.date],
      ["Source", r.source],
      ["Date note", r.date_note],
      ["Convert", r.convert],
      ["Record ID", r.id],
    ];
    el("detail-content").innerHTML = `
      <p class="eyebrow" style="color:#7a493d">Historical record</p>
      <h2>${escapeHtml(r.name)}</h2>
      <dl class="record-fields">${fields.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || "Not documented")}</dd>`).join("")}</dl>
      ${r.origin_status === "unmapped_named" || r.captivity_status === "unmapped_named" ? "<p class=\"hint\"><strong>Mapping note:</strong> A named place is preserved in this record but has not been positioned because its identification is unresolved.</p>" : ""}`;
    el("detail-panel").hidden = false;
    el("detail-panel").scrollTop = 0;
    el("detail-panel").focus?.();
  }

  function renderCatalogue() {
    const records = catalogueRecords();
    const pageCount = Math.max(1, Math.ceil(records.length / state.pageSize));
    state.page = Math.min(state.page, pageCount);
    const start = (state.page - 1) * state.pageSize;
    const page = records.slice(start, start + state.pageSize);
    const locationText = state.locationFilter ? " at the selected location" : "";
    el("catalogue-count").textContent = `${number.format(records.length)} matching record${records.length === 1 ? "" : "s"}${locationText}.`;
    el("clear-location-filter").hidden = !state.locationFilter;
    el("catalogue-list").innerHTML = page.length ? page.map((r) => `
      <article class="catalogue-card">
        <div>
          <h3>${escapeHtml(r.name)}</h3>
          <p><strong>Origin:</strong> ${escapeHtml(r.place_of_origin)} · <strong>Captivity:</strong> ${escapeHtml(r.place_of_captivity)}</p>
          <p>${escapeHtml(r.date)} · ${escapeHtml(r.id)}</p>
        </div>
        <button class="button secondary small" type="button" data-record-id="${escapeHtml(r.id)}">View record</button>
      </article>`).join("") : "<p>No records match these filters. Try clearing the search or choosing a different catalogue filter.</p>";
    el("page-status").textContent = `Page ${state.page} of ${pageCount}`;
    el("previous-page").disabled = state.page <= 1;
    el("next-page").disabled = state.page >= pageCount;
  }

  function openCatalogue() {
    state.page = 1;
    renderCatalogue();
    const dialog = el("catalogue-dialog");
    if (!dialog.open) dialog.showModal();
  }

  function switchBaseLayer(name) {
    const cfg = baseLayers[name];
    if (!cfg) return;
    if (activeBaseLayer) map.removeLayer(activeBaseLayer);
    activeBaseLayer = L.tileLayer(cfg.url, cfg.options).addTo(map);
    activeBaseLayer.bringToBack();
    el("basemap-note").textContent = cfg.note;
  }

  function renderHelp() {
    const step = helpSteps[state.helpStep];
    el("help-step").innerHTML = `<p class="step-number">Step ${state.helpStep + 1}</p><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.body)}</p>`;
    el("help-progress").textContent = `${state.helpStep + 1} of ${helpSteps.length}`;
    el("help-previous").disabled = state.helpStep === 0;
    el("help-next").textContent = state.helpStep === helpSteps.length - 1 ? "Finish" : "Next";
  }

  function openHelp() {
    state.helpStep = 0;
    renderHelp();
    if (!el("help-dialog").open) el("help-dialog").showModal();
  }

  function closeHelp() {
    if (el("dont-show-help").checked) localStorage.setItem("europeanCaptivesHelpSeen", "yes");
    el("help-dialog").close();
  }

  function resetMap() {
    state.mode = "both";
    state.period = "all";
    state.from = 1500;
    state.to = 1800;
    state.query = "";
    state.catalogueFilter = "all";
    state.locationFilter = null;
    state.showConnections = false;
    document.querySelector('input[name="map-mode"][value="both"]').checked = true;
    el("period-select").value = "all";
    el("custom-dates").hidden = true;
    el("year-from").value = "1500";
    el("year-to").value = "1800";
    el("search-input").value = "";
    el("catalogue-filter").value = "all";
    el("connections-toggle").checked = false;
    el("detail-panel").hidden = true;
    map.setView([37.5, 1.5], 4);
    renderAll();
  }

  function bindEvents() {
    document.querySelectorAll('input[name="map-mode"]').forEach((input) => input.addEventListener("change", (event) => {
      state.mode = event.target.value;
      renderAll();
    }));
    el("search-input").addEventListener("input", debounce((event) => {
      state.query = event.target.value.trim();
      state.page = 1;
      renderAll();
    }));
    el("clear-search").addEventListener("click", () => {
      el("search-input").value = "";
      state.query = "";
      renderAll();
      el("search-input").focus();
    });
    el("period-select").addEventListener("change", (event) => {
      state.period = event.target.value;
      el("custom-dates").hidden = state.period !== "custom";
      renderAll();
    });
    const updateYears = () => {
      state.from = Number(el("year-from").value) || 1500;
      state.to = Number(el("year-to").value) || 1800;
      if (state.from > state.to) [state.from, state.to] = [state.to, state.from];
      renderAll();
    };
    el("year-from").addEventListener("change", updateYears);
    el("year-to").addEventListener("change", updateYears);
    el("basemap-select").addEventListener("change", (event) => switchBaseLayer(event.target.value));
    el("connections-toggle").addEventListener("change", (event) => {
      state.showConnections = event.target.checked;
      renderAll();
    });
    el("reset-button").addEventListener("click", resetMap);
    el("catalogue-button").addEventListener("click", () => { state.locationFilter = null; openCatalogue(); });
    el("close-catalogue").addEventListener("click", () => el("catalogue-dialog").close());
    el("catalogue-filter").addEventListener("change", (event) => {
      state.catalogueFilter = event.target.value;
      state.page = 1;
      renderCatalogue();
    });
    el("clear-location-filter").addEventListener("click", () => {
      state.locationFilter = null;
      state.page = 1;
      renderCatalogue();
    });
    el("previous-page").addEventListener("click", () => { state.page -= 1; renderCatalogue(); });
    el("next-page").addEventListener("click", () => { state.page += 1; renderCatalogue(); });
    el("close-detail").addEventListener("click", () => { el("detail-panel").hidden = true; });
    el("help-button").addEventListener("click", openHelp);
    el("close-help").addEventListener("click", closeHelp);
    el("help-previous").addEventListener("click", () => { state.helpStep = Math.max(0, state.helpStep - 1); renderHelp(); });
    el("help-next").addEventListener("click", () => {
      if (state.helpStep === helpSteps.length - 1) closeHelp();
      else { state.helpStep += 1; renderHelp(); }
    });
    el("help-dialog").addEventListener("cancel", (event) => { event.preventDefault(); closeHelp(); });
    document.addEventListener("click", (event) => {
      const recordButton = event.target.closest("[data-record-id]");
      if (recordButton) {
        if (el("catalogue-dialog").open) el("catalogue-dialog").close();
        showRecord(recordButton.dataset.recordId);
      }
      const locationButton = event.target.closest("[data-open-location]");
      if (locationButton) {
        state.locationFilter = locationButton.dataset.openLocation;
        state.catalogueFilter = "all";
        el("catalogue-filter").value = "all";
        openCatalogue();
      }
    });
  }

  async function init() {
    if (typeof L === "undefined") throw new Error("Leaflet did not load. Check your internet connection or content-blocking settings.");
    const [recordsResponse, locationsResponse, connectionsResponse] = await Promise.all([
      fetch("data/records.json"),
      fetch("data/locations.geojson"),
      fetch("data/connections.geojson"),
    ]);
    if (![recordsResponse, locationsResponse, connectionsResponse].every((r) => r.ok)) throw new Error("One or more map data files could not be loaded.");
    state.records = await recordsResponse.json();
    state.locations = await locationsResponse.json();
    state.connections = await connectionsResponse.json();
    recordsById = new Map(state.records.map((r) => [r.id, r]));

    map = L.map("map", { zoomControl: true, minZoom: 2, preferCanvas: true }).setView([37.5, 1.5], 4);
    markerLayer = L.layerGroup().addTo(map);
    connectionLayer = L.layerGroup().addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
    switchBaseLayer("english");
    bindEvents();
    renderAll();
    if (!localStorage.getItem("europeanCaptivesHelpSeen")) setTimeout(openHelp, 450);
  }

  init().catch((error) => {
    console.error(error);
    const mapNode = el("map");
    mapNode.innerHTML = `<div class="error-box"><h2>The map could not start</h2><p>${escapeHtml(error.message)}</p><p>The complete CSV dataset is still available from the download button above.</p></div>`;
  });
})();
