import './FilterPanel.css'

// Capitalize a mineral name for display (data stores them lowercase).
function label(m) {
    return m.charAt(0).toUpperCase() + m.slice(1)
}

function FilterPanel({ minerals, selectedMineral, onSelect, onClose }) {
    return (
        <div className="filter-panel">
            <div className="filter-panel-header">
                <span>Minerals</span>
                <button className="filter-panel-close" onClick={onClose}>×</button>
            </div>
            <ul className="filter-panel-list">
                {minerals.map(m => (
                    <li
                        key={m}
                        className={`clickable ${m === selectedMineral ? 'selected' : ''}`}
                        onClick={() => onSelect(m === selectedMineral ? null : m)}
                    >
                        {label(m)}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default FilterPanel
