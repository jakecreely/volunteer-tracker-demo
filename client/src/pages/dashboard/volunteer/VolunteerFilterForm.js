import React from 'react'
import { Container, Box, FormControl, Select, MenuItem, TextField, Grid, Button, Paper, FormControlLabel, Checkbox } from '@mui/material'
import { useNavigate } from 'react-router-dom';

export function VolunteerFilterForm(props) {

    const navigate = useNavigate()

    return (
        <React.Fragment>
            <Box component={Paper} mb={2}>
                <Box component="form" onSubmit={props.handleSubmit}>
                    <FormControl>
                        <Grid container p={2} spacing={2}>
                            <Grid item>
                                <TextField
                                    id="name"
                                    label="Enter Name To Filter"
                                    variant="outlined"
                                    size="small"
                                    value={props.name}
                                    onChange={props.handleNameChange}
                                />
                            </Grid>
                            <Grid item>
                                <Select
                                    multiple
                                    size="small"
                                    value={props.selectedRoles}
                                    onChange={props.handleSelectedRoles}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return <em>Filter by Role</em>;
                                        }
                                        return selected.join(', ');
                                    }}
                                >
                                    {props.roles && props.roles.map(elem => {
                                        return <MenuItem key={elem._id} value={elem.name}>{elem.name}</MenuItem>
                                    })}
                                </Select>
                            </Grid>
                            <Grid item>
                                <FormControlLabel
                                    control={<Checkbox
                                        checked={props.showArchived}
                                        onChange={(e) => props.handleArchiveChange(e)}
                                        name="archived"
                                        id="archived"
                                    />}
                                    label="Show Archived"
                                />
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => navigate('/dashboard/create-volunteer')}
                                >
                                    Create Volunteer
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant='outlined'
                                    color='secondary'
                                    onClick={(e) => props.handleReset(e)}
                                >
                                    Reset Filter
                                </Button>
                            </Grid>
                        </Grid>
                    </FormControl>
                </Box>
            </Box>
        </React.Fragment>
    )
}