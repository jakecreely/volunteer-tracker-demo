import React, { useEffect, useState } from 'react';
import { Box, Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import { AlertDialog } from '../../../components/AlertDialog';
import { useDeleteTrainingMutation, useGetRolesQuery, useGetTrainingByIdQuery, useGetTrainingWithVolunteerUsageQuery, useGetVolunteersQuery, useUpdateTrainingMutation } from '../../../lib/apiSlice';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { useUpdateFeedbackDisplay } from '../../../hooks/useUpdateFeedbackDisplay';
import { useDeleteFeedbackDisplay } from '../../../hooks/useDeleteFeedbackDisplay';
import { BasicError } from '../../../components/BasicError';
import { TrainingContainer } from '../components/TrainingContainer';
import { formatExcludedRoles } from '../utils/format';

export function Training() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isTrainingDeleted, setIsTrainingDeleted] = useState(false)
    const [training, setTraining] = useState(null)
    const [trainingSuccess, setTrainingSuccess] = useState(false)
    const [selectedExcludedRoles, setSelectedExcludedRoles] = useState([])
    const [open, setOpen] = useState(false);

    const [
        updateTraining,
        {
            isLoading: isUpdatingTraining,
            isSuccess: updateTrainingSuccess,
            isError: updateTrainingFailed,
            error: updateTrainingErrorData
        }
    ] = useUpdateTrainingMutation()

    const [
        deleteTraining,
        {
            isLoading: isDeletingTraining,
            isSuccess: deleteTrainingSuccess,
            isError: deleteTrainingFailed,
            error: deleteTrainingErrorData
        }
    ] = useDeleteTrainingMutation()

    const {
        data: fetchedTraining,
        isLoading: isFetchingTraining,
        isSuccess: fetchedTrainingSuccess,
        isError: fetchedTrainingFailed,
        error: fetchedTrainingErrorData
    } = useGetTrainingByIdQuery(id, {
        skip: deleteTrainingSuccess || isTrainingDeleted
    })

    const {
        data: fetchedRoles,
        isLoading: isFetchingRoles,
        isSuccess: fetchedRolesSuccess,
        isError: fetchedRolesFailed,
        error: fetchedRolesErrorData
    } = useGetRolesQuery()

    const {
        data: fetchedTrainingWithVolunteerUsage,
        isLoading: fetchingTrainingWithVolunteerUsage,
        isSuccess: fetchedTrainingWithVolunteerUsageSuccess,
        isError: fetchedRolesWithVolunteerUsageFailed,
        error: fetchedRolesWithVolunteerUsageErrorData
    } = useGetTrainingWithVolunteerUsageQuery(id, {
        skip: deleteTrainingSuccess || isTrainingDeleted
    })

    const updateFeedbackDisplay = useUpdateFeedbackDisplay('Training', isUpdatingTraining, updateTrainingSuccess, updateTrainingFailed, updateTrainingErrorData)
    const deleteFeedbackDisplay = useDeleteFeedbackDisplay('Training', isDeletingTraining, deleteTrainingSuccess, deleteTrainingFailed, deleteTrainingErrorData)

    useEffect(() => {
        if (fetchedTrainingSuccess) {
            setTraining(fetchedTraining)
            setSelectedExcludedRoles(fetchedTraining.excludedRoles.map(role => role.name))
            setTrainingSuccess(true)
        }
    }, [fetchedTrainingSuccess])

    useEffect(() => {
        if (updateTrainingSuccess) {
            navigate('/dashboard/training?updated=true')
        }
    }, [updateTrainingSuccess])

    useEffect(() => {
        if (deleteTrainingSuccess) {
            navigate('/dashboard/training?deleted=true')
        }
    }, [deleteTrainingSuccess])

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
        let trainingToSubmit = JSON.parse(JSON.stringify(training))
        const formattedTrainingToSubmit = await formatExcludedRoles(fetchedRoles, trainingToSubmit, selectedExcludedRoles)
        updateTraining(formattedTrainingToSubmit)
    }

    const handleDelete = async (e) => {
        e.preventDefault()
        if (fetchedTrainingWithVolunteerUsageSuccess) {
            if (fetchedTrainingWithVolunteerUsage.isVolunteerUsingTraining) {
                setOpen(true);
                return;
            } else {
                deleteTraining(id)
                setIsTrainingDeleted(true)
            }
        }
    }

    if (isFetchingTraining || isFetchingRoles || fetchingTrainingWithVolunteerUsage) return (<LoadingTableSkeleton />)
    if (fetchedTrainingFailed) return (<BasicError error={fetchedTrainingErrorData.data} />)
    if (fetchedRolesFailed) return (<BasicError error={fetchedRolesErrorData.data} />)
    if (fetchedRolesWithVolunteerUsageFailed) return (<BasicError error={fetchedRolesWithVolunteerUsageErrorData.data} />)

    if (trainingSuccess && fetchedTrainingSuccess && fetchedRoles && fetchedTrainingWithVolunteerUsageSuccess) {
        return (
            <TrainingContainer>
                <AlertDialog
                    open={open}
                    setOpen={() => setOpen(!open)}
                    title="Unable to Delete Training"
                    message="Looks like this training is being used by one or more volunteers. Please remove this training from the volunteers before deleting it."
                    closeMessage="Close"
                />
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
                {updateFeedbackDisplay}
                {deleteFeedbackDisplay}
            </TrainingContainer>
        )
    }
}