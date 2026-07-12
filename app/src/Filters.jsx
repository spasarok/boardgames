import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Slider from '@mui/material/Slider'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

function formatMinutes(m) {
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    const rem = m % 60
    return rem ? `${h}h ${rem}m` : `${h}h`
}

function FilterSection({label, onClear, children}) {
    return (
        <Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                <Typography variant="caption" color="text.secondary" sx={{fontWeight: 500}}>
                    {label}
                </Typography>
                {onClear && (
                    <Button
                        size="small"
                        onClick={onClear}
                        sx={{minWidth: 0, p: 0, fontSize: '0.7rem', lineHeight: 1, color: 'text.disabled'}}
                    >
                        clear
                    </Button>
                )}
            </Box>
            {children}
        </Box>
    )
}

export default function Filters({filters, onChange, onClearAll, allCategories, playTimeRange, playersRange, weightOptions}) {
    const update = (key, value) => onChange({...filters, [key]: value})

    const isFiltered = filters.favoritesOnly || filters.ownedOnly || filters.cooperative !== 'all' ||
        filters.categories.length > 0 || filters.playTimeMax != null ||
        filters.playerCount != null || filters.weights.length > 0

    return (
        <Box sx={{mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.75)', borderRadius: 1}}>
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start'}}>
            <FilterSection label="Cooperative">
                <ToggleButtonGroup
                    value={filters.cooperative}
                    exclusive
                    size="small"
                    onChange={(_, v) => v && update('cooperative', v)}
                >
                    <ToggleButton value="all">All</ToggleButton>
                    <ToggleButton value="cooperative">Co-op</ToggleButton>
                    <ToggleButton value="competitive">Competitive</ToggleButton>
                </ToggleButtonGroup>
            </FilterSection>

            <FilterSection
                label={filters.categories.length ? `Categories (${filters.categories.length})` : 'Categories'}
                onClear={filters.categories.length ? () => update('categories', []) : null}
            >
                <Autocomplete
                    multiple
                    size="small"
                    options={allCategories}
                    value={filters.categories}
                    onChange={(_, v) => update('categories', v)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder={filters.categories.length ? '' : 'All categories'}
                            size="small"
                        />
                    )}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip label={option} size="small" {...getTagProps({index})} key={option}/>
                        ))
                    }
                    sx={{width: 280}}
                />
                {filters.categories.length > 1 && (
                    <Box sx={{mt: 0.5, display: 'flex', alignItems: 'center', gap: 1}}>
                        <Typography variant="caption" color="text.secondary">Match:</Typography>
                        <ToggleButtonGroup
                            value={filters.categoriesMode}
                            exclusive
                            size="small"
                            onChange={(_, v) => v && update('categoriesMode', v)}
                        >
                            <ToggleButton value="any">Any</ToggleButton>
                            <ToggleButton value="all">All</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}
            </FilterSection>

            <FilterSection
                label="Max Play Time"
                onClear={filters.playTimeMax != null ? () => update('playTimeMax', null) : null}
            >
                <Box sx={{px: 1, pt: 1}}>
                    <Slider
                        value={filters.playTimeMax ?? playTimeRange[1]}
                        min={playTimeRange[0]}
                        max={playTimeRange[1]}
                        step={15}
                        marks={[
                            {value: playTimeRange[0], label: formatMinutes(playTimeRange[0])},
                            {value: playTimeRange[1], label: formatMinutes(playTimeRange[1])},
                        ]}
                        onChange={(_, v) => update('playTimeMax', v === playTimeRange[1] ? null : v)}
                        valueLabelDisplay="auto"
                        valueLabelFormat={formatMinutes}
                        sx={{width: 180}}
                    />
                </Box>
            </FilterSection>

            <FilterSection
                label="Players"
                onClear={filters.playerCount != null ? () => update('playerCount', null) : null}
            >
                <Box sx={{px: 1, pt: 1}}>
                    <Slider
                        value={filters.playerCount ?? playersRange[1]}
                        min={playersRange[0]}
                        max={playersRange[1]}
                        step={1}
                        marks={[
                            {value: playersRange[0], label: playersRange[0]},
                            {value: playersRange[1], label: playersRange[1]},
                        ]}
                        onChange={(_, v) => update('playerCount', v)}
                        valueLabelDisplay="auto"
                        sx={{width: 140}}
                    />
                </Box>
            </FilterSection>

            <FilterSection
                label="Weight"
                onClear={filters.weights.length ? () => update('weights', []) : null}
            >
                <ToggleButtonGroup
                    value={filters.weights}
                    size="small"
                    onChange={(_, v) => update('weights', v)}
                >
                    {weightOptions.map(w => (
                        <ToggleButton key={w} value={w} sx={{textTransform: 'capitalize'}}>
                            {w}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </FilterSection>

            <FilterSection label="Favorites">
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={filters.favoritesOnly}
                            onChange={(e) => update('favoritesOnly', e.target.checked)}
                            size="small"
                            color="primary"
                        />
                    }
                    label="Favorites"
                    sx={{m: 0}}
                />
            </FilterSection>

            <FilterSection label="Owned">
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={filters.ownedOnly}
                            onChange={(e) => update('ownedOnly', e.target.checked)}
                            size="small"
                            color="primary"
                        />
                    }
                    label="Own"
                    sx={{m: 0}}
                />
            </FilterSection>

                {isFiltered && (
                    <Box sx={{alignSelf: 'center', ml: 'auto'}}>
                        <Button variant="outlined" size="small" onClick={onClearAll}
                            color="primary">
                            Clear all
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    )
}
