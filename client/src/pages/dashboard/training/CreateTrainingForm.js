import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useAddTrainingMutation, useGetRolesQuery } from '../../../features/api/apiSlice';
import { LoadingTableSkeleton } from '../LoadingTableSkeleton';

export function CreateTrainingForm(props) {
    let navigate = useNavigate();

    const {
        data: fetchedRoles,
        isLoading: fetchedRolesLoading,
        isSuccess: fetchedRolesSuccess,
        error: fetchedRolesError
    } = useGetRolesQuery()

    const [
        addTraining,
        {
            isLoading: isAdding,
            isSuccess: addSuccess
        }
    ] = useAddTrainingMutation()

    let [training, setTraining] = useState({
        name: "",
        renewalFrequency: null,
        excludedRoles: []
    })

    let [selectedExcludedRoles, setSelectedExcludedRoles] = useState([])

    const handleNameChange = (e) => {
        setTraining(prev => {
            return {
                ...prev,
                name: e.target.value
            }
        })
    }

    const handleRenewalFrequencyChange = (e) => {
        setTraining(prev => {
            return {
                ...prev,
                renewalFrequency: e.target.value
            }
        })
    }

    const handleExcludedRolesChange = (e) => {
        setSelectedExcludedRoles(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let localTraining = JSON.parse(JSON.stringify(training))

        const formatExcludedRoles = async (localTraining) => {
            localTraining.excludedRoles = fetchedRoles.filter(role => {
                return selectedExcludedRoles.includes(role.name)
            })

            localTraining.excludedRoles = localTraining.excludedRoles.map(role => {
                return {
                    roleId: role._id,
                    name: role.name
                }
            })
            return localTraining
        }

        let temp = await formatExcludedRoles(localTraining)
        addTraining(temp)
    }

    useEffect(() => {
        if (addSuccess) {
            navigate('/dashboard/training')
        }
    }, [addSuccess])

    if (fetchedRolesLoading) return (<LoadingTableSkeleton />)

    return (
        <Grid container justifyContent={'center'} >
            <Grid item xs={12} md={6}>
                <Card>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        <FormControl>
                            <Grid container justifyContent={'center'} p={2} spacing={2}>
                                <Grid item xs={10}>
                                    <TextField
                                        id="name"
                                        name="name"
                                        label="Name"
                                        size="small"
                                        required
                                        fullWidth
                                        value={training.name}
                                        onChange={(e) => handleNameChange(e)}
                                    />
                                </Grid>
                                <Grid item xs={10}>
                                    <TextField
                                        id="length"
                                        name="length"
                                        label="Length (Years)"
                                        type="number"
                                        size="small"
                                        required
                                        fullWidth
                                        value={training.length}
                                        onChange={(e) => handleRenewalFrequencyChange(e)}
                                    />
                                </Grid>
                                <Grid item xs={10}>
                                    <FormControl fullWidth>
                                        <InputLabel id="excludedRoles" size="small">Excluded Roles</InputLabel>
                                        <Select
                                            multiple
                                            id="excludedRole-select"
                                            labelId='excludedRoles'
                                            value={selectedExcludedRoles}
                                            onChange={(e) => handleExcludedRolesChange(e)}
                                            size="small"
                                            fullWidth
                                            label="Excluded Roles"
                                            renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value, index) => {
                                                    if (index === selected.length - 1) {
                                                        return (
                                                            <div key={value}>{value}</div>
                                                        )
                                                    } else {
                                                        return (
                                                            <div key={value}>{value + ", "}</div>
                                                        )
                                                    }
                                                })}
                                            </Box>}
                                        >
                                            {fetchedRolesSuccess && fetchedRoles.map((role) => {
                                                return (
                                                    <MenuItem value={role.name}>
                                                        {role.name}
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={10} textAlign={'center'}>
                                    <Button variant="outlined" type="submit">
                                        Create
                                    </Button>
                                </Grid>
                            </Grid>
                        </FormControl>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    )
}