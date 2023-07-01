import { AppBar, Container, Toolbar, Typography, Menu, MenuItem, Grid, Button, TextField, Card, InputAdornment } from '@mui/material/';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { apiSlice } from '../../features/api/apiSlice';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export function UpdateContainer(props) {

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
                </Grid>
                <Grid item alignItems="center" justify="center">
                    <Button
                        variant="outlined"
                        onClick={() => setRefresh(true)}
                        endIcon={<RefreshIcon />}
                    >
                        Refresh
                    </Button>
                </Grid>
            </Grid>
        </Card>
    )
}