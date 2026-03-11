import { useMemo } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CssBaseline from '@mui/material/CssBaseline'
import Chip from '@mui/material/Chip'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import rawData from '../data/games.yaml'

const theme = createTheme()

/** Render a list of strings as compact Chips. */
function ChipList({ values }) {
  if (!values?.length) return null
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.5 }}>
      {values.map((v) => (
        <Chip key={v} label={v} size="small" variant="outlined" />
      ))}
    </Box>
  )
}

const columns = [
  { field: 'name', headerName: 'Game', width: 185, sortable: true },
  { field: 'genre', headerName: 'Genre', width: 150, sortable: true },
  {
    field: 'mechanics',
    headerName: 'Mechanics',
    flex: 1,
    minWidth: 240,
    sortable: false,
    renderCell: ({ value }) => <ChipList values={value} />,
  },
  { field: 'players', headerName: 'Players', width: 90, sortable: true },
  { field: 'playtime', headerName: 'Playtime', width: 115, sortable: true },
  {
    field: 'weight',
    headerName: 'Weight',
    width: 85,
    type: 'number',
    sortable: true,
  },
  {
    field: 'played',
    headerName: 'Played',
    width: 85,
    type: 'boolean',
    sortable: true,
  },
]

export default function App() {
  const rows = useMemo(
    () =>
      Object.entries(rawData.games ?? {}).map(([name, game], i) => ({
        id: i,
        name,
        genre: game.genre ?? '',
        // Keep as array; the renderCell above renders chips
        mechanics: Array.isArray(game.mechanics) ? game.mechanics : [],
        players: game.player_count
          ? `${game.player_count.min}–${game.player_count.max}`
          : '',
        playtime: game.playtime
          ? `${game.playtime.min}–${game.playtime.max}`
          : '',
        weight: typeof game.weight === 'number' ? game.weight : null,
        played: game.played === true,
      })),
    []
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Board Games
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {rows.length} game{rows.length !== 1 ? 's' : ''} · Click column
          headers to sort
        </Typography>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
            }}
            getRowHeight={() => 'auto'}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
