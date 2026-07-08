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
// dropped from the map. `layer` is 'mining' | 'refining'. `value` is the raw
// tonnage/count column, which differs per sheet ('share' vs 'number').
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

function MineralMap() {
    const [nodes, setNodes] = useState([])
    const [selectedMineral, setSelectedMineral] = useState(null)

    useEffect(() => {
        Promise.all([parseCsv(MINING_URL), parseCsv(REFINING_URL)])
            .then(([mining, refining]) => {
                setNodes([
                    ...buildNodes(mining, 'mining', 'share'),
                    ...buildNodes(refining, 'refining', 'number'),
                ])
            })
    }, [])

    // Minerals that exist in the data, sorted — drives the search filter list.
    const minerals = useMemo(
        () => [...new Set(nodes.map(n => n.mineral))].sort(),
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
