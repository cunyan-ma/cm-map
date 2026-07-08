import './SearchBox.css'

function SearchBox({ open, onToggle, mineralCount }) {
    return (
        <div className="search-box">
            <div className="search-box-title">Search by:</div>
            <button
                className={`search-box-item ${open ? 'active' : ''}`}
                onClick={onToggle}
            >
                Mineral ({mineralCount})
            </button>
        </div>
    )
}

export default SearchBox
