import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Box, Button, Card, Chip, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useNavigate } from "react-router-dom";
import AlertDialog from '../../../components/AlertDialog';
import { useDeleteTrainingMutation, useGetRolesQuery, useGetTrainingByIdQuery, useGetVolunteersQuery, useUpdateTrainingMutation } from '../../../lib/apiSlice';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { StatusSnackbar } from '../../../components/StatusSnackbar';

export default function UpdateTrainingForm(props) {
    let navigate = useNavigate();

    const { id } = useParams();
    const [isTrainingDeleted, setIsTrainingDeleted] = useState(false)
    let [training, setTraining] = useState(null)
    let [trainingSuccess, setTrainingSuccess] = useState(false)
    let [selectedExcludedRoles, setSelectedExcludedRoles] = useState([])
    const [open, setOpen] = useState(false);
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    const [
        updateTraining,
        {
            isLoading: isUpdating,
            isSuccess: updateSuccess,
            isError: isUpdateError,
            error: updateError
        }
    ] = useUpdateTrainingMutation()

    const [
        deleteTraining,
        {
            isLoading: isDeleting,
            isSuccess: deleteSuccess,
            isError: isDeleteError,
            error: deleteError
        }
    ] = useDeleteTrainingMutation()

    const {
        data: fetchedTraining,
        isLoading: fetchedTrainingLoading,
        isSuccess: fetchedTrainingSuccess,
        error: fetchedTrainingError
    } = useGetTrainingByIdQuery(id, {
        skip: deleteSuccess || isTrainingDeleted
    })

    const {
        data: fetchedVolunteers,
        isLoading: fetchedVolunteersLoading,
        isSuccess: fetchedVolunteersSuccess,
        error: fetchedVolunteersError
    } = useGetVolunteersQuery()

    const {
        data: fetchedRoles,
        isLoading: fetchedRolesLoading,
        isSuccess: fetchedRolesSuccess,
        error: fetchedRolesError
    } = useGetRolesQuery()

    useEffect(() => {
        if (isUpdating) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Updating Training... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isUpdating])

    useEffect(() => {
        if (isUpdateError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Updating Training Failed!"}
                    errorMessage={updateError.data}
                    statusType={"error"}
                />
            )
        }
    }, [isUpdateError])

    useEffect(() => {
        if (isDeleting) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Deleting Training... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isDeleting])

    useEffect(() => {
        if (isDeleteError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Deleting Role Failed!"}
                    errorMessage={deleteError.data}
                    statusType={"error"}
                />
            )
        }
    }, [isDeleteError])

    useEffect(() => {
        if (fetchedTrainingSuccess) {
            setTraining(fetchedTraining)
            setSelectedExcludedRoles(fetchedTraining.excludedRoles.map(role => role.name))
            setTrainingSuccess(true)
        }
    }, [fetchedTrainingSuccess])

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
        }

        await formatExcludedRoles(localTraining)

        updateTraining(localTraining)
    }

    useEffect(() => {
        if (updateSuccess) {
            navigate('/dashboard/training?updated=true')
        }
    }, [updateSuccess])

    const handleDelete = async (e) => {
        const seeIfTrainingIsUsedByVolunteers = () => {
            let volunteersUsingTraining = fetchedVolunteers.filter(volunteer => {
                let trainingIds = []
                volunteer.training.map(volunteerTraining => {
                    if (volunteerTraining.trainingId === id) {
                        trainingIds.push(id)
                    }
                })
                return trainingIds.includes(id)
            })

            if (volunteersUsingTraining.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        if (!seeIfTrainingIsUsedByVolunteers()) {
            deleteTraining(id)
            setIsTrainingDeleted(true)
        } else {
            setOpen(true);
        }
    }

    useEffect(() => {
        if (deleteSuccess) {
            navigate('/dashboard/training?deleted=true')
        }
    }, [deleteSuccess])

    if (fetchedTrainingLoading || fetchedVolunteersLoading) return (<LoadingTableSkeleton />)
    if (fetchedTrainingError || fetchedVolunteersError) return <div>Error</div>

    if (trainingSuccess && fetchedTrainingSuccess && fetchedVolunteersSuccess && fetchedRoles) {
        return (
            <Box>
                <Grid container justifyContent={'center'} >
                    <AlertDialog
                        open={open}
                        setOpen={() => setOpen(!open)}
                        title="Unable to Delete Training"
                        message="Looks like this training is being used by one or more volunteers. Please remove this training from the volunteers before deleting it."
                        closeMessage="Close"
                    />
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
                                                required
                                                size="small"
                                                fullWidth
                                                value={training.name}
                                                onChange={(e) => handleNameChange(e)}
                                            />
                                        </Grid>
                                        <Grid item xs={10}>
                                            <TextField
                                                id="renewalFrequency"
                                                name="renewalFrequency"
                                                label="Length (Years)"
                                                type="number"
                                                size="small"
                                                required
                                                fullWidth
                                                value={training.renewalFrequency}
                                                onChange={(e) => handleRenewalFrequencyChange(e)}
                                            />
                                        </Grid>
                                        <Grid item xs={10}>
                                            <FormControl fullWidth>
                                                <InputLabel id="excludedRoles" size="small">Roles Excluded From Training</InputLabel>
                                                <Select
                                                    multiple
                                                    id="excludedRoles"
                                                    name="excludedRoles"
                                                    labelId='excludedRoles-helper-text'
                                                    value={selectedExcludedRoles}
                                                    onChange={(e) => handleExcludedRolesChange(e)}
                                                    size="small"
                                                    label="Roles Excluded From Training"
                                                    displayEmpty
                                                    renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value, index) => {
                                                            if (selected.length === 0) {
                                                                return (
                                                                    <div key={0}>No Excluded Roles</div>
                                                                )
                                                            }
                                                            else if (index === selected.length - 1) {
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
                                                    fullWidth
                                                >
                                                    {fetchedRolesSuccess && fetchedRoles.map((role) => {
                                                        return (
                                                            <MenuItem key={role._id} value={role.name}>
                                                                {role.name}
                                                            </MenuItem>
                                                        )
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item sx={{ textAlign: 'center' }} xs={6}>
                                            <Button variant="outlined" type="submit">
                                                Update
                                            </Button>
                                        </Grid>
                                        <Grid item sx={{ textAlign: 'center' }} xs={6}>
                                            <Button variant="outlined" onClick={handleDelete}>
                                                Delete
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </FormControl>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
                {feedbackDisplay}
            </Box>
        )
    }
}