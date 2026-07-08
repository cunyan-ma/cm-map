import './MineralInfo.css'

function label(m) {
    return m.charAt(0).toUpperCase() + m.slice(1)
}

// Countries in one layer for the selected mineral, sorted by share desc.
function layerRows(nodes, mineral, layer) {
    return nodes
        .filter(n => n.mineral === mineral && n.layer === layer)
        .sort((a, b) => b.perc - a.perc)
}

function LayerList({ title, rows }) {
    if (rows.length === 0) return null
    return (
        <>
            <div className="mineral-info-subtitle">{title}</div>
            <ul className="mineral-info-list">
                {rows.map(r => (
                    <li key={r.id}>
                        <span>{r.country}</span>
                        <span className="mineral-info-value">{r.perc.toFixed(1)}%</span>
                    </li>
                ))}
            </ul>
        </>
    )
}

function MineralInfo({ mineral, nodes = [], onClose }) {
    const mining = layerRows(nodes, mineral, 'mining')
    const refining = layerRows(nodes, mineral, 'refining')
    const source = (mining[0] || refining[0])?.source

    return (
        <div className="mineral-info">
            <div className="mineral-info-header">
                <span>{label(mineral)}</span>
                <button className="mineral-info-close" onClick={onClose}>×</button>
            </div>

            <div className="mineral-info-description">
                <span>
                    {mining.length} mining and {refining.length} refining countries
                    supply {label(mineral)}. Share of world total:
                </span>
            </div>

            <LayerList title="Mining" rows={mining} />
            <LayerList title="Refining" rows={refining} />

            {source && (
                <div className="mineral-info-note">Source: {source}</div>
            )}
        </div>
    )
}

export default MineralInfo
