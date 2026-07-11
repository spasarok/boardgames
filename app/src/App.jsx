import {useMemo, useState} from 'react'
import {DataGrid} from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import CssBaseline from '@mui/material/CssBaseline'
import Chip from '@mui/material/Chip'
import {ThemeProvider, createTheme, useTheme} from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import rawData from '../data/games.yaml'
import rawWeights from '../data/weights.yaml'
import rawIcons from '../data/icons.yaml'
import * as MuiIcons from '@mui/icons-material'
import Filters from './Filters'

const theme = createTheme()

function formatMinutes(m) {
    if (m == null) return ''
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    const rem = m % 60
    return rem ? `${h}h ${rem}m` : `${h}h`
}

function toMinutes(v) {
    if (v == null) return null
    if (typeof v === 'string' && v.includes(':')) {
        const [h, m] = v.split(':').map(Number)
        return h * 60 + m
    }
    return Math.round(Number(v) * 60)
}

/** Render a list of strings as compact Chips. */
function ChipList({values}) {
    if (!values?.length) return null
    return (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.5}}>
            {values.map((v) => (
                <Chip key={v} label={v} size="small" variant="outlined"/>
            ))}
        </Box>
    )
}

function GameCard({row}) {
    const statusEntry = statusIconMap[row.status]
    const StatusIcon = statusEntry ? MuiIcons[statusEntry.icon] : null
    const ownershipEntry = ownershipIconMap[row.ownership]
    const OwnershipIcon = ownershipEntry ? MuiIcons[ownershipEntry.icon] : null
    const meta = [
        row.players && `${row.players} players`,
        row.playTimeMax && `Up to ${formatMinutes(row.playTimeMax)}`,
        row.weight != null && `Weight ${row.weight}`,
    ].filter(Boolean).join(' · ')
    return (
        <Card variant="outlined">
            <CardContent sx={{'&:last-child': {pb: 1.5}, pt: 1.5, px: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                    {StatusIcon && <StatusIcon fontSize="small" sx={{color: statusEntry.color}} titleAccess={statusEntry.key}/>}
                    <Typography variant="subtitle1" fontWeight="bold" sx={{flex: 1}}>{row.name}</Typography>
                    {row.cooperative && <Typography variant="caption" sx={{bgcolor: 'action.selected', px: 0.75, py: 0.25, borderRadius: 0.5}}>Co-op</Typography>}
                    {OwnershipIcon && <OwnershipIcon fontSize="small" sx={{color: ownershipEntry.color}} titleAccess={ownershipEntry.key}/>}
                </Box>
                {row.categories.length > 0 && <Box sx={{mb: 0.75}}><ChipList values={row.categories}/></Box>}
                {meta && <Typography variant="body2" color="text.secondary">{meta}</Typography>}
            </CardContent>
        </Card>
    )
}

const statusIconMap = Object.fromEntries(
    (rawIcons.icons?.statuses ?? []).map(e => [e.key, e])
)
const ownershipIconMap = Object.fromEntries(
    (rawIcons.icons?.ownerships ?? []).map(e => [e.key, e])
)

const columns = [
    {
        field: 'status',
        headerName: 'Status',
        width: 60,
        sortable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({value}) => {
            if (!value) return null
            const entry = statusIconMap[value]
            if (!entry) return null
            const Icon = MuiIcons[entry.icon]
            return Icon ? <Icon fontSize="small" sx={{color: entry.color}} titleAccess={entry.key}/> : null
        },
    },
    {field: 'name', headerName: 'Game', sortable: true, minWidth: 125},
    {field: 'cooperative', headerName: 'Cooperative', type: 'boolean', sortable: true},
    {
        field: 'categories',
        headerName: 'Categories',
        sortable: false,
        flex: 1,
        minWidth: 150,
        renderCell: ({value}) => <ChipList values={value}/>,
    },
    {field: 'players', headerName: 'Players', sortable: true},
    {
        field: 'playTimeMax',
        headerName: 'Max Play Time',
        sortable: true,
        type: 'number',
        align: 'left',
        headerAlign: 'left',
        valueFormatter: (value) => formatMinutes(value),
    },
    {field: 'weight', headerName: 'Weight', sortable: true, align: 'left', headerAlign: 'left'},
    {
        field: 'ownership',
        headerName: 'Ownership',
        width: 90,
        sortable: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({value}) => {
            if (!value) return null
            const entry = ownershipIconMap[value]
            if (!entry) return null
            const Icon = MuiIcons[entry.icon]
            return Icon ? <Icon fontSize="small" sx={{color: entry.color}} titleAccess={entry.key}/> : null
        },
    },
    // {field: 'rating', headerName: 'Rating', sortable: true},
    // {field: 'notes', headerName: 'Notes', flex: 1, minWidth: 100, sortable: false},
]

export default function App() {
    const muiTheme = useTheme()
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))

    const rows = useMemo(
        () =>
            Object.entries(rawData.games ?? {}).map(([name, game], i) => {
                const pt = game.play_time ?? game.playtime
                const pc = game.player_count
                return {
                    id: i,
                    name,
                    status: game.status ?? null,
                    cooperative: game.cooperative === true,
                    categories: Array.isArray(game.categories) ? game.categories : [],
                    players: pc ? `${pc.min}–${pc.max}` : '',
                    playerMin: pc?.min ?? null,
                    playerMax: pc?.max ?? null,
                    playTimeMin: pt ? toMinutes(pt.min) : null,
                    playTimeMax: pt ? toMinutes(pt.max) : null,
                    weight: typeof game.weight === 'number' ? game.weight : null,
                    ownership: game.ownership ?? null,
                }
            }),
        []
    )

    const allCategories = useMemo(() => {
        const set = new Set()
        rows.forEach(r => r.categories.forEach(c => set.add(c)))
        return [...set].sort()
    }, [rows])

    const playTimeRange = useMemo(() => {
        const mins = rows.flatMap(r => [r.playTimeMin, r.playTimeMax]).filter(v => v != null)
        return mins.length ? [Math.min(...mins), Math.max(...mins)] : [0, 180]
    }, [rows])

    const playersRange = useMemo(() => {
        const vals = rows.flatMap(r => [r.playerMin, r.playerMax]).filter(v => v != null)
        return vals.length ? [Math.min(...vals), Math.max(...vals)] : [1, 10]
    }, [rows])

    const weightOptions = useMemo(() => Object.keys(rawWeights.weights ?? rawWeights), [])

    const defaultFilters = {
        favoritesOnly: false,
        ownedOnly: false,
        cooperative: 'all',
        categories: [],
        categoriesMode: 'any',
        playTimeMax: null,
        playerCount: null,
        weights: [],
    }

    const [filters, setFilters] = useState(defaultFilters)
    const [filtersOpen, setFiltersOpen] = useState(false)

    const filteredRows = useMemo(() => {
        return rows.filter(row => {
            if (filters.favoritesOnly && row.status !== 'Favorite') return false
            if (filters.ownedOnly && row.ownership !== 'Own' && row.ownership !== 'Trade/Sell') return false
            if (filters.cooperative === 'cooperative' && !row.cooperative) return false
            if (filters.cooperative === 'competitive' && row.cooperative) return false

            if (filters.categories.length > 0) {
                const match = filters.categoriesMode === 'any'
                    ? filters.categories.some(c => row.categories.includes(c))
                    : filters.categories.every(c => row.categories.includes(c))
                if (!match) return false
            }

            if (filters.playTimeMax != null && row.playTimeMax != null && row.playTimeMax > filters.playTimeMax) return false

            if (filters.playerCount != null) {
                if (row.playerMin != null && row.playerMin > filters.playerCount) return false
                if (row.playerMax != null && row.playerMax < filters.playerCount) return false
            }

            if (filters.weights.length > 0) {
                if (row.weight == null) return false
                const weightData = rawWeights.weights ?? rawWeights
                const inRange = filters.weights.some(w => {
                    const range = weightData[w]
                    return row.weight >= range.min && row.weight <= range.max
                })
                if (!inRange) return false
            }

            return true
        })
    }, [rows, filters])

    const sortedFilteredRows = useMemo(
        () => [...filteredRows].sort((a, b) => a.name.localeCompare(b.name)),
        [filteredRows]
    )

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Box sx={{p: {xs: 2, md: 3}}}>
                <Typography variant="h4" gutterBottom>
                    Board Games
                </Typography>
                {isMobile ? (
                    <>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setFiltersOpen(o => !o)}
                            endIcon={<MuiIcons.FilterList/>}
                            sx={{mb: 1}}
                        >
                            Filters
                        </Button>
                        <Collapse in={filtersOpen}>
                            <Filters
                                filters={filters}
                                onChange={setFilters}
                                onClearAll={() => setFilters(defaultFilters)}
                                allCategories={allCategories}
                                playTimeRange={playTimeRange}
                                playersRange={playersRange}
                                weightOptions={weightOptions}
                            />
                        </Collapse>
                    </>
                ) : (
                    <Filters
                        filters={filters}
                        onChange={setFilters}
                        onClearAll={() => setFilters(defaultFilters)}
                        allCategories={allCategories}
                        playTimeRange={playTimeRange}
                        playersRange={playersRange}
                        weightOptions={weightOptions}
                    />
                )}
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                    {filteredRows.length === rows.length
                        ? `${rows.length} game${rows.length !== 1 ? 's' : ''}`
                        : `${filteredRows.length} of ${rows.length} games`
                    }{!isMobile && ' · Click column headers to sort'}
                </Typography>
                {isMobile ? (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                        {sortedFilteredRows.map(row => (
                            <GameCard key={row.id} row={row}/>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{width: '100%'}}>
                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: {paginationModel: {pageSize: 25}},
                                sorting: {sortModel: [{field: 'name', sort: 'asc'}]},
                            }}
                            autosizeOnMount
                            autosizeOptions={{expand: true}}
                            getRowHeight={() => 'auto'}
                            disableRowSelectionOnClick
                            sx={{
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: 'action.hover',
                                },
                            }}
                        />
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    )
}
