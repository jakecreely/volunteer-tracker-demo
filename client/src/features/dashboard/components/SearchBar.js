import { Grid, Button, TextField, Card } from '@mui/material/';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { apiSlice } from '../../../lib/apiSlice';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export function SearchBar(props) {
    const [localFilterTime, setLocalFilterTime] = useState(props.filterTime)
    const dispatch = useDispatch()
    const [refresh, setRefresh] = useState(false)

    useEffect(() => {
        if (refresh) {
            dispatch(apiSlice.util.resetApiState())
            setRefresh(false)
        }
    }, [refresh, dispatch])

    const handleSubmit = () => {
        props.setFilterTime(localFilterTime)
    }

    useEffect(() => {
        if (props.filterTime !== null) {
            setLocalFilterTime(props.filterTime)
        }
    }, [props.filterTime])

    return (
        <SearchContainer>
            <Grid container spacing={2}>
                <Grid item>
                    <TextField
                        size="small"
                        type="number"
                        name="filterTime"
                        value={localFilterTime}
                        onChange={(e) => setLocalFilterTime(e.target.value)}
                        label="Days to Search For"
                        variant="outlined"
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant="outlined"
                        onClick={() => handleSubmit()}
                        endIcon={<SearchIcon />}
                    >
                        Search
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={(e) => props.setFilterTime(0)}
                        endIcon={<CloseIcon />}
                    >
                        Reset
                    </Button>
                </Grid>
            </Grid>
        </SearchContainer>
    )
}

function SearchContainer({ children }) {
    return (
        <Card sx={{ marginBottom: 2 }}>
            <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                padding={2}
                rowGap={2}
            >
                <Grid item alignItems="center" justify="center">
                    {children}
                </Grid>
            </Grid>
        </Card>
    )
}