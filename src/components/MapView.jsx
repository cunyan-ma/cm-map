import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Node colors (kept in sync with index.css). Shapes are used in addition to
// color so the three node types stay distinguishable for color-blind viewers:
//   mining   = dark green  circle
//   refining = light green square
//   sales    = white       triangle
const COLORS = {
    mining:   '#158a3f',
    refining: '#8ce06a',
    sales:    '#ffffff',
}

// Per-layer opacity states, applied as { fillOpacity, opacity }.
const DEFAULTS = {
    mining:   { fillOpacity: 0.6,  opacity: 0.9 },
    refining: { fillOpacity: 0.6,  opacity: 0.9 },
    sales:    { fillOpacity: 0.5,  opacity: 0.7 },
}
const HIGHLIGHT = {
    mining:   { fillOpacity: 0.95, opacity: 1 },
    refining: { fillOpacity: 0.95, opacity: 1 },
    sales:    { fillOpacity: 0.9,  opacity: 1 },
}
const DIMMED = {
    mining:   { fillOpacity: 0.05, opacity: 0.06 },
    refining: { fillOpacity: 0.05, opacity: 0.06 },
    sales:    { fillOpacity: 0.05, opacity: 0.06 },
}

// Node size is proportional to the "perc" column. We scale AREA with perc
// (radius ∝ √perc), the perceptually correct convention for proportional-symbol
// maps, then clamp so tiny shares stay visible and huge ones don't dominate.
const MIN_R = 4
const MAX_R = 26
function radiusFor(perc) {
    const r = Math.sqrt(Math.max(perc, 0)) * 3.3
    return Math.max(MIN_R, Math.min(MAX_R, r))
}

// Same-country nodes from different layers/minerals share a centroid, so nudge
// each apart: layer shifts longitude, mineral index shifts latitude. Keeps
// overlapping nodes legible without distorting geography much.
function offsetFor(layer, mineralIndex, mineralCount) {
    const lng = layer === 'mining' ? -2.8 : layer === 'refining' ? 2.8 : 0
    const lat = mineralCount > 1
        ? (mineralIndex - (mineralCount - 1) / 2) * 2.4
        : 0
    return [lat, lng]
}

// Build the SVG for a square/triangle divIcon at a given pixel size. viewBox is
// fixed at 0 0 20 20 so the shape scales to `size` via width/height.
function shapeSvg(shape, color, size, { fillOpacity, opacity }) {
    const inner = shape === 'square'
        ? `<rect class="node-shape" x="2" y="2" width="16" height="16" fill="${color}" stroke="${color}" stroke-width="1" fill-opacity="${fillOpacity}" stroke-opacity="${opacity}"/>`
        : `<polygon class="node-shape" points="10,2.5 18.5,18 1.5,18" fill="${color}" stroke="${color}" stroke-width="1" stroke-linejoin="round" fill-opacity="${fillOpacity}" stroke-opacity="${opacity}"/>`
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="display:block;overflow:visible;cursor:pointer">${inner}</svg>`
}

function makeShapeIcon(shape, color, size, style) {
    return L.divIcon({
        className: 'node-marker',   // custom class → drops the default leaflet-div-icon box
        html: shapeSvg(shape, color, size, style),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2], // center the shape on its coordinate
    })
}

// Apply a { fillOpacity, opacity } state to any node regardless of shape.
// circleMarkers use setStyle; shaped divIcon markers get their SVG element's
// fill/stroke opacity updated in place (no icon rebuild, so events survive).
function applyStyle(marker, style) {
    if (marker instanceof L.CircleMarker) {
        marker.setStyle(style)
        return
    }
    const el = marker.getElement()
    const shape = el && el.querySelector('.node-shape')
    if (shape) {
        shape.setAttribute('fill-opacity', style.fillOpacity)
        shape.setAttribute('stroke-opacity', style.opacity)
    }
}

// On a short (mobile) viewport a fixed zoom-2 world view gets cropped; fit the
// whole world into the available space instead.
const WORLD_BOUNDS = L.latLngBounds([-58, -170], [78, 170])
function isMobileViewport() {
    return window.matchMedia('(max-width: 900px)').matches
}
function setWorldView(map) {
    if (isMobileViewport()) {
        map.fitBounds(WORLD_BOUNDS)
    } else {
        map.setView([20, 0], 2)
    }
}

function MapView({ nodes = [], selectedMineral = null, onSelectMineral = () => {} }) {
    const containerRef = useRef(null)
    const mapRef = useRef(null)

    // [{ marker, node }] for every rendered node
    const markersRef = useRef([])

    // Keep the selected mineral current inside Leaflet's stale event closures.
    const selectedMineralRef = useRef(selectedMineral)
    useEffect(() => { selectedMineralRef.current = selectedMineral }, [selectedMineral])

    // Apply highlight/dim styles for a given mineral (or default when null).
    const applyMineralStyles = useCallback((mineral) => {
        markersRef.current.forEach(({ marker, node }) => {
            if (!mineral) {
                applyStyle(marker, DEFAULTS[node.layer])
            } else {
                applyStyle(marker, node.mineral === mineral ? HIGHLIGHT[node.layer] : DIMMED[node.layer])
            }
        })
    }, [])

    // ── Init map ─────────────────────────────────────────────────────────
    useEffect(() => {
        const map = L.map(containerRef.current)
        mapRef.current = map
        setWorldView(map)

        L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_dark/{z}/{x}/{y}{r}.{ext}', {
            minZoom: 0,
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            ext: 'png',
        }).addTo(map)

        const handleResize = () => {
            map.invalidateSize()
            if (!selectedMineralRef.current) setWorldView(map)
        }
        window.addEventListener('resize', handleResize)
        window.addEventListener('orientationchange', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('orientationchange', handleResize)
            map.remove()
        }
    }, [])

    // ── Render node markers whenever data changes ────────────────────────
    useEffect(() => {
        const map = mapRef.current
        if (!map || nodes.length === 0) return

        markersRef.current.forEach(({ marker }) => map.removeLayer(marker))
        markersRef.current = []

        // Mineral → index, for the small lat offset that separates overlapping nodes.
        const minerals = [...new Set(nodes.map(n => n.mineral))].sort()
        const mineralIndex = Object.fromEntries(minerals.map((m, i) => [m, i]))

        nodes.forEach(node => {
            const color = COLORS[node.layer]
            const style = DEFAULTS[node.layer]
            const r = radiusFor(node.perc)
            const [dLat, dLng] = offsetFor(node.layer, mineralIndex[node.mineral], minerals.length)
            const pos = [node.lat + dLat, node.lng + dLng]

            let marker
            if (node.layer === 'mining') {
                // dark green circle
                marker = L.circleMarker(pos, {
                    radius: r, fillColor: color, color, weight: 1, ...style,
                })
            } else {
                // refining = light green square, sales = white triangle
                const shape = node.layer === 'refining' ? 'square' : 'triangle'
                marker = L.marker(pos, { icon: makeShapeIcon(shape, color, r * 2, style) })
            }

            marker.on('mouseover', () => applyMineralStyles(node.mineral))
            marker.on('mouseout', () => applyMineralStyles(selectedMineralRef.current))
            marker.on('click', () => onSelectMineral(node.mineral))

            marker.addTo(map)
            markersRef.current.push({ marker, node })
        })

        // Re-apply whatever selection is active to the freshly built markers.
        applyMineralStyles(selectedMineralRef.current)
    }, [nodes, applyMineralStyles, onSelectMineral])

    // ── React to selection changes (from the filter list or node clicks) ──
    useEffect(() => {
        applyMineralStyles(selectedMineral)
    }, [selectedMineral, applyMineralStyles])

    return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
}

export default MapView
