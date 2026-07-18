import {useMemo, useState, useCallback, useRef, useEffect} from 'react'
import {DataGrid, gridSortedRowIdsSelector} from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import CssBaseline from '@mui/material/CssBaseline'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import {ThemeProvider, createTheme, useTheme} from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import rawData from '../data/games.yaml'
import rawWeights from '../data/weights.yaml'
import rawIcons from '../data/icons.yaml'
import * as MuiIcons from '@mui/icons-material'
import Filters from './Filters'

const COLORS = {
    frenchBlue:  '#1e3888',
    pacificBlue: '#47a8bd',
    bananaCream: '#f5e663',
    sandyBrown:  '#ffad69',
    burntRose:   '#9c3848',
    ink:         '#1a1a2e',
    background:  '#1e3888',
}

const theme = createTheme({
    palette: {
        primary: {main: COLORS.frenchBlue},
        text: {primary: COLORS.ink},
    },
})

const pipLayouts = {
    1: [[0, 0]],
    2: [[-0.3, -0.3], [0.3, 0.3]],
    3: [[-0.3, -0.3], [0, 0], [0.3, 0.3]],
    4: [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]],
    5: [[-0.3, -0.3], [0.3, -0.3], [0, 0], [-0.3, 0.3], [0.3, 0.3]],
    6: [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0], [0.3, 0], [-0.3, 0.3], [0.3, 0.3]],
}

function Die({x, y, size, rotation, face, color, pipColor, opacity = 0.18}) {
    const pips = pipLayouts[face] ?? []
    return (
        <g transform={`rotate(${rotation}, ${x}, ${y})`} opacity={opacity}>
            <rect x={x - size / 2} y={y - size / 2} width={size} height={size} rx={size * 0.16} fill={color}/>
            {pips.map(([px, py], i) => (
                <circle key={i} cx={x + px * size * 0.55} cy={y + py * size * 0.55} r={size * 0.08} fill={pipColor}/>
            ))}
        </g>
    )
}

function PageBackground() {
    const dice = [
        {x: 120,  y: 180, size: 110, rotation:  15, face: 6, color: COLORS.frenchBlue,  pipColor: COLORS.bananaCream},
        {x: 1080, y: 280, size:  95, rotation: -20, face: 4, color: COLORS.burntRose,   pipColor: '#ffffff'},
        {x: 380,  y: 620, size:  80, rotation:  30, face: 2, color: COLORS.pacificBlue, pipColor: '#ffffff'},
        {x: 820,  y: 130, size:  85, rotation: -12, face: 5, color: COLORS.frenchBlue,  pipColor: COLORS.sandyBrown},
        {x: 620,  y: 700, size:  70, rotation:  25, face: 3, color: COLORS.burntRose,   pipColor: COLORS.bananaCream},
        {x: 230,  y: 530, size:  55, rotation: -35, face: 1, color: COLORS.sandyBrown,  pipColor: COLORS.frenchBlue},
        {x: 960,  y: 560, size:  65, rotation:  40, face: 6, color: COLORS.pacificBlue, pipColor: COLORS.bananaCream},
        {x: 700,  y: 380, size:  45, rotation: -18, face: 3, color: COLORS.bananaCream, pipColor: COLORS.frenchBlue},
        {x: 480,  y: 200, size:  50, rotation:  50, face: 5, color: COLORS.burntRose,   pipColor: '#ffffff'},
    ]
    return (
        <Box aria-hidden sx={{position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1, overflow: 'hidden', bgcolor: 'rgba(71,168,189,0.12)'}}>
            <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={{width: '100%', height: '100%'}}>
                {dice.map((d, i) => <Die key={i} {...d}/>)}
            </svg>
        </Box>
    )
}

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

function ChipList({values, selectedValues, onToggle}) {
    if (!values?.length) return null
    return (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.5}}>
            {values.map((v) => {
                const selected = selectedValues?.includes(v)
                return (
                    <Chip
                        key={v}
                        label={v}
                        size="small"
                        onClick={onToggle ? () => onToggle(v) : undefined}
                        variant={selected ? 'filled' : 'outlined'}
                        color={selected ? 'primary' : 'default'}
                    />
                )
            })}
        </Box>
    )
}

function GameCard({row, selectedCategories, onCategoryToggle}) {
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
        <Card variant="outlined" sx={{backgroundColor: 'rgba(255,255,255,0.75)'}}>
            <CardContent sx={{'&:last-child': {pb: 1.5}, pt: 1.5, px: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                    {StatusIcon && <StatusIcon fontSize="small" sx={{color: statusEntry.color}} titleAccess={statusEntry.key}/>}
                    <Typography variant="subtitle1" fontWeight="bold" sx={{flex: 1}}>{row.name}</Typography>
                    {row.categories.includes('Cooperative') && <Typography variant="caption" sx={{bgcolor: 'action.selected', px: 0.75, py: 0.25, borderRadius: 0.5}}>Co-op</Typography>}
                    {row.categories.includes('Semi-cooperative') && <Typography variant="caption" sx={{bgcolor: 'action.selected', px: 0.75, py: 0.25, borderRadius: 0.5}}>Semi-coop</Typography>}
                    {OwnershipIcon && <OwnershipIcon fontSize="small" sx={{color: ownershipEntry.color}} titleAccess={ownershipEntry.key}/>}
                </Box>
                {row.categories.length > 0 && <Box sx={{mb: 0.75}}><ChipList values={row.categories} selectedValues={selectedCategories} onToggle={onCategoryToggle}/></Box>}
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

export default function App() {
    const muiTheme = useTheme()
    const mdBreakpoint = useMediaQuery(muiTheme.breakpoints.down('md'))
    const pageRef = useRef(null)
    const [tableOverflows, setTableOverflows] = useState(false)

    useEffect(() => {
        const el = pageRef.current
        if (!el) return
        // 50 + 60 + 300 + 120 + 90 + 130 + 80 + ~30 chrome = ~860
        const MIN_TABLE_WIDTH = 880
        const ro = new ResizeObserver(([entry]) => {
            setTableOverflows(entry.contentRect.width < MIN_TABLE_WIDTH)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const isMobile = mdBreakpoint || tableOverflows

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
        return vals.length ? [Math.min(...vals), 12] : [1, 12]
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
            if (filters.cooperative === 'cooperative' && !row.categories.includes('Cooperative') && !row.categories.includes('Semi-cooperative')) return false
            if (filters.cooperative === 'competitive' && (row.categories.includes('Cooperative') || row.categories.includes('Semi-cooperative'))) return false

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

    const handleCategoryToggle = useCallback((cat) => {
        setFilters(f => ({
            ...f,
            categories: f.categories.includes(cat)
                ? f.categories.filter(c => c !== cat)
                : [...f.categories, cat],
        }))
    }, [])

    const effectiveSelectedCategories = useMemo(() => {
        const cats = [...filters.categories]
        if (filters.cooperative === 'cooperative') {
            if (!cats.includes('Cooperative')) cats.push('Cooperative')
            if (!cats.includes('Semi-cooperative')) cats.push('Semi-cooperative')
        }
        return cats
    }, [filters.categories, filters.cooperative])

    const columns = useMemo(() => [
        {
            field: '__rowNum__',
            headerName: '#',
            width: 50,
            sortable: false,
            disableColumnMenu: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const sortedIds = gridSortedRowIdsSelector(params.api.state, params.api.instanceId)
                const index = sortedIds.indexOf(params.id)
                return (
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                        {index + 1}
                    </Box>
                )
            },
        },
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
                return Icon ? <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}><Icon fontSize="small" sx={{color: entry.color}} titleAccess={entry.key}/></Box> : null
            },
        },
        {
            field: 'name', headerName: 'Game', sortable: true, width: 300,
            renderCell: ({value, row}) => {
                const notOwned = row.ownership !== 'Own'
                return (
                    <Box sx={{display: 'flex', alignItems: 'center', height: '100%', gap: 0.5, color: notOwned ? 'text.disabled' : 'inherit'}}>
                        {value}
                        {notOwned && (
                            <Tooltip title="Not in Collection">
                                <MuiIcons.WarningAmber sx={{fontSize: 16, color: 'text.disabled'}}/>
                            </Tooltip>
                        )}
                    </Box>
                )
            },
        },
        {
            field: 'categories',
            headerName: 'Categories',
            sortable: false,
            flex: 1,
            minWidth: 120,
            renderCell: ({value}) => (
                <Box sx={{display: 'flex', alignItems: 'center', height: '100%', width: '100%'}}>
                    <ChipList values={value} selectedValues={effectiveSelectedCategories} onToggle={handleCategoryToggle}/>
                </Box>
            ),
        },
        {field: 'players', headerName: 'Players', sortable: true, width: 90, renderCell: ({value}) => <Box sx={{display: 'flex', alignItems: 'center', height: '100%'}}>{value}</Box>},
        {
            field: 'playTimeMax',
            headerName: 'Max Play Time',
            sortable: true,
            width: 130,
            type: 'number',
            align: 'left',
            headerAlign: 'left',
            renderCell: ({value}) => <Box sx={{display: 'flex', alignItems: 'center', height: '100%'}}>{formatMinutes(value)}</Box>,
        },
        {field: 'weight', headerName: 'Weight', sortable: true, width: 80, align: 'left', headerAlign: 'left', renderCell: ({value}) => <Box sx={{display: 'flex', alignItems: 'center', height: '100%'}}>{value}</Box>},
    ], [effectiveSelectedCategories, handleCategoryToggle])

    const sortedFilteredRows = useMemo(
        () => [...filteredRows].sort((a, b) => a.name.localeCompare(b.name)),
        [filteredRows]
    )

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <PageBackground/>
            <Box ref={pageRef} sx={{p: {xs: 2, md: 3}}}>
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
                            <GameCard key={row.id} row={row} selectedCategories={effectiveSelectedCategories} onCategoryToggle={handleCategoryToggle}/>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{width: '100%'}}>
                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            pageSizeOptions={[25, 50, 100]}
                            initialState={{
                                pagination: {paginationModel: {pageSize: 100}},
                                sorting: {sortModel: [{field: 'name', sort: 'asc'}]},
                            }}
                            getRowHeight={() => 'auto'}
                            disableRowSelectionOnClick
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.75)',
                                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {outline: 'none'},
                                '& .MuiDataGrid-row:hover': {backgroundColor: 'action.hover'},
                            }}
                        />
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    )
}
