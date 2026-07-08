import { useEffect, useState, useMemo } from 'react'
import Papa from 'papaparse'
import MapView from '../components/MapView'
import BottomBar from '../components/BottomBar'
import Legend from '../components/Legend'
import MineralInfo from '../components/MineralInfo'
import { centroidFor } from '../data/countryCentroids'
import './MineralMap.css'

// Fetched live from the published-to-web Google Sheet (File → Share → Publish
// to web → CSV). Editing the sheet updates the map on the next page load; note
// Google caches the published CSV for a few minutes, so edits appear with a
// short delay rather than instantly. The two gids are the two tabs.
const SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUxjwO7T53MfOt5-nwL3c9yu_SvzVhlZwJkINeOXL4kmdmvPJBeVPZ_1a5ip4moR1JOTvgrfck8afS/pub'
const MINING_URL = `${SHEET}?gid=0&single=true&output=csv`             // dark green nodes
const REFINING_URL = `${SHEET}?gid=1699648875&single=true&output=csv` // light green nodes
const SALES_URL = `${SHEET}?gid=519586379&single=true&output=csv`     // white triangles
// NOTE: the Sales tab must be Published to web (File → Share → Publish to web →
// pick the Sales sheet, or "Entire Document"). Until it is, this URL 401s; the
// loader below tolerates that so mining/refining still render.

// Promise wrapper around Papa.parse so both source sheets can be loaded together.
function parseCsv(url) {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            header: true,
            complete: (results) => resolve(results.data),
            error: reject,
        })
    })
}

// Numbers in the sheets are sometimes quoted with thousands separators
// (e.g. "1,050"). Strip commas before parsing.
function num(v) {
    if (v == null) return NaN
    return parseFloat(String(v).replace(/,/g, '').trim())
}

// Turn one CSV row into a node. A row with an unknown country (no centroid) is
// dropped from the map. `layer` is 'mining' | 'refining' | 'sales'. `value` is
// the raw column that differs per sheet ('share' / 'number' / 'size'); note the
// sales sheet's size is a mockup, so sales nodes are drawn at a fixed size (see
// MapView) rather than scaled by it.
function buildNodes(rows, layer, valueKey) {
    return rows
        .filter(r => r.name?.trim() && r.country?.trim())
        .map((r, i) => {
            const coords = centroidFor(r.country)
            if (!coords) return null
            const perc = num(r.perc)
            return {
                id: `${layer}-${r.name.trim()}-${r.country.trim()}-${i}`,
                layer,
                mineral: r.name.trim().toLowerCase(),
                country: r.country.trim(),
                perc: Number.isFinite(perc) ? perc : 0,
                value: num(r[valueKey]),
                total: num(r.total),
                source: r.source?.trim() || '',
                date: r.date?.trim() || '',
                lat: coords[0],
                lng: coords[1],
            }
        })
        .filter(Boolean)
}

// Sales rows have a different schema: name is a company/site (not a mineral),
// and the sheet carries real city-level lat/lng plus a mockup `size`. So sales
// nodes are mineral-agnostic (mineral: null → excluded from the mineral filter
// and drawn as a constant white-triangle layer at a fixed size in MapView).
function buildSalesNodes(rows) {
    return rows
        .filter(r => r.name?.trim() && r.country?.trim())
        .map((r, i) => {
            const lat = num(r.lat)
            const lng = num(r.lng)
            const coords = (Number.isFinite(lat) && Number.isFinite(lng))
                ? [lat, lng]
                : centroidFor(r.country)      // fall back to centroid if a row lacks coords
            if (!coords) return null
            return {
                id: `sales-${r.name.trim()}-${i}`,
                layer: 'sales',
                mineral: null,                 // not mineral-specific
                name: r.name.trim(),           // company / site
                country: r.country.trim(),
                city: r.city?.trim() || '',
                perc: 0,
                lat: coords[0],
                lng: coords[1],
            }
        })
        .filter(Boolean)
}

function MineralMap() {
    const [nodes, setNodes] = useState([])
    const [selectedMineral, setSelectedMineral] = useState(null)

    useEffect(() => {
        Promise.all([
            parseCsv(MINING_URL),
            parseCsv(REFINING_URL),
            // Sales tab may not be published yet → 401. Don't let it fail the
            // whole load; fall back to no sales rows.
            parseCsv(SALES_URL).catch(() => []),
        ])
            .then(([mining, refining, sales]) => {
                setNodes([
                    ...buildNodes(mining, 'mining', 'share'),
                    ...buildNodes(refining, 'refining', 'number'),
                    ...buildSalesNodes(sales),
                ])
            })
    }, [])

    // Minerals that exist in the data, sorted — drives the search filter list.
    const minerals = useMemo(
        // filter(Boolean) drops sales nodes (mineral: null) from the search list.
        () => [...new Set(nodes.map(n => n.mineral).filter(Boolean))].sort(),
        [nodes]
    )

    return (
        <div className="mineralmap">
            <div className="map-wrap">
                <MapView
                    nodes={nodes}
                    selectedMineral={selectedMineral}
                    onSelectMineral={setSelectedMineral}
                />
            </div>

            <Legend />

            {selectedMineral && (
                <MineralInfo
                    mineral={selectedMineral}
                    nodes={nodes}
                    onClose={() => setSelectedMineral(null)}
                />
            )}

            <BottomBar
                minerals={minerals}
                selectedMineral={selectedMineral}
                onSelectMineral={setSelectedMineral}
            />
        </div>
    )
}

export default MineralMap
