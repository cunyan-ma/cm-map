import { useState, useEffect } from 'react'
import './Database.css'

// Same three published-sheet tabs the map reads from (File → Share → Publish to
// web → CSV). Kept self-contained here, mirroring dal-map's Database page.
const SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUxjwO7T53MfOt5-nwL3c9yu_SvzVhlZwJkINeOXL4kmdmvPJBeVPZ_1a5ip4moR1JOTvgrfck8afS/pub'
const MINING_URL = `${SHEET}?gid=0&single=true&output=csv`
const REFINING_URL = `${SHEET}?gid=1699648875&single=true&output=csv`
const SALES_URL = `${SHEET}?gid=519586379&single=true&output=csv`

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim())
  return lines.map(line => {
    const cols = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        inQuote = !inQuote
      } else if (ch === ',' && !inQuote) {
        cols.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    cols.push(cur)
    return cols
  })
}

function useCSV(url) {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) return
    fetch(url)
      .then(r => r.text())
      .then(text => {
        const parsed = parseCSV(text)
        if (parsed.length > 0) {
          setHeaders(parsed[0])
          setRows(parsed.slice(1))
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load database.')
        setLoading(false)
      })
  }, [url])

  return { headers, rows, loading, error }
}

function TablePreview({ headers, rows }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DatabaseColumn({ title, href, description, data, placeholder }) {
  return (
    <div className="db-column">
      <a className="db-column-title" href={href} target="_blank" rel="noreferrer">
        {title}
      </a>
      <p className="db-column-desc">{description}</p>
      {placeholder ? (
        <div className="db-preview-placeholder" />
      ) : data.loading ? (
        <div className="db-preview-placeholder">
          <span className="db-status">Loading...</span>
        </div>
      ) : data.error ? (
        <div className="db-preview-placeholder">
          <span className="db-status db-error">{data.error}</span>
        </div>
      ) : (
        <TablePreview headers={data.headers} rows={data.rows} />
      )}
    </div>
  )
}

function Database() {
  const mining = useCSV(MINING_URL)
  const refining = useCSV(REFINING_URL)
  const sales = useCSV(SALES_URL)

  return (
    <div className="database-page">
      <div className="database-header">
        <h1>Database</h1>
        <div className="database-subtitle">
          This map traces critical minerals across three levels of material flow.
          The underlying data is a work in progress and incomplete:
          <ul>
            <li>
              mining: country-level share of critical-mineral mining, drawn
              mainly from USGS (US Geological Survey) reports.
            </li>
            <li>
              refining: country-level share of refining, drawn mainly from the
              IEA Critical Minerals Data Explorer and the EU Raw Material
              Information System (RMIS).
            </li>
            <li>
              sales: notable sites of GPU/AI hardware concentration. A mockup for
              now--positions are real but the weighting is placeholder.
            </li>
          </ul>
        </div>
      </div>

      <div className="db-columns">
        <DatabaseColumn
          title="mining.csv"
          href={MINING_URL}
          data={mining}
        />
        <DatabaseColumn
          title="refining.csv"
          href={REFINING_URL}
          data={refining}
        />
        <DatabaseColumn
          title="sales.csv"
          href={SALES_URL}
          data={sales}
        />
      </div>
    </div>
  )
}

export default Database
