import './Legend.css'

function Legend() {
    return (
        <div className="legend">
            <div className="legend-title">Layers</div>
            <div className="legend-item">
                <svg className="legend-swatch legend-swatch-shape" viewBox="0 0 20 20" aria-hidden="true">
                    <polygon points="10,2.5 18.5,18 1.5,18" fill="rgba(255,255,255,0.15)" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                Sales
            </div>
            <div className="legend-item">
                <svg className="legend-swatch legend-swatch-shape" viewBox="0 0 20 20" aria-hidden="true">
                    <rect x="2" y="2" width="16" height="16" fill="rgba(140,224,106,0.2)" stroke="#8ce06a" strokeWidth="1.5" />
                </svg>
                Refining
            </div>
            <div className="legend-item">
                <span className="legend-swatch legend-swatch-mining" />
                Mining
            </div>
            <div className="legend-note">Node size ∝ share (%)</div>
        </div>
    )
}

export default Legend
