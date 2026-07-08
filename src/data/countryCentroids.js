// Approximate country centroids ([lat, lng]) for every country that appears in
// the mining / refining source sheets. The CSVs give a country name but no
// coordinates, so each node is placed at its country's centroid.
//
// Some source rows use alternate spellings or long-form names for the same
// country (e.g. "Congo (Kinshasa)" vs "Congo", the misspelled "Khazakastan",
// "Korea, Republic of"). ALIASES maps those to a canonical key below.

const CENTROIDS = {
    Australia:       [-25.0, 133.0],
    Bolivia:         [-16.3, -63.6],
    Brazil:          [-10.3, -53.0],
    Burundi:         [-3.4, 29.9],
    Canada:          [56.1, -106.3],
    Chile:           [-35.7, -71.5],
    China:           [35.9, 104.2],
    'Congo':         [-4.0, 21.8],
    Cuba:            [21.5, -79.5],
    Estonia:         [58.6, 25.0],
    Ethiopia:        [9.1, 40.5],
    Finland:         [64.5, 26.0],
    Germany:         [51.2, 10.4],
    India:           [22.6, 79.0],
    Indonesia:       [-2.5, 118.0],
    Japan:           [36.2, 138.3],
    Kazakhstan:      [48.0, 66.9],
    Korea:           [36.5, 127.8],
    Madagascar:      [-19.0, 46.7],
    Mexico:          [23.6, -102.5],
    Mozambique:      [-18.7, 35.5],
    Nigeria:         [9.1, 8.7],
    'Papua New Guinea':[-6.3, 143.9],
    Peru:            [-9.2, -75.0],
    Philippines:     [12.9, 121.8],
    Poland:          [51.9, 19.1],
    Russia:          [61.5, 105.3],
    Rwanda:          [-1.9, 29.9],
    Thailand:        [15.9, 100.9],
    Turkey:          [39.0, 35.2],
    'United Kingdom':[54.0, -2.0],
    'United States': [39.8, -98.6],
    Zambia:          [-13.1, 27.8],
}

// Alternate spellings / long-form names → canonical CENTROIDS key.
const ALIASES = {
    'Congo (Kinshasa)':   'Congo',
    'Congo (Brazzaville)':'Congo',
    'Indonedia':          'Indonesia',   // common misspelling in the source sheet
    'Khazakastan':        'Kazakhstan',
    'Korea, Republic of': 'Korea',
    'Republic of Korea':  'Korea',
    'South Korea':        'Korea',
    'United States of America': 'United States',
    'USA':                'United States',
    'UK':                 'United Kingdom',
}

// Look up a country's [lat, lng]. Returns null for names we don't know, so the
// caller can skip drawing that node (but it can still be listed elsewhere).
export function centroidFor(country) {
    if (!country) return null
    const name = country.trim()
    const canonical = ALIASES[name] || name
    return CENTROIDS[canonical] || null
}

export default CENTROIDS
