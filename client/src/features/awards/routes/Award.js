import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Box, Button, Card, FormControl, Grid, TextField } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { AlertDialog } from '../../../components/AlertDialog';
import { useDeleteAwardMutation, useGetAwardByIdQuery, useGetAwardsWithVolunteerUsageQuery, useGetVolunteersQuery, useUpdateAwardMutation } from '../../../lib/apiSlice';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { useUpdateFeedbackDisplay } from '../../../hooks/useUpdateFeedbackDisplay';
import { useDeleteFeedbackDisplay } from '../../../hooks/useDeleteFeedbackDisplay';
import { BasicError } from '../../../components/BasicError';
import { AwardContainer } from '../components/AwardContainer';

export function Award() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAwardDeleted, setIsAwardDeleted] = useState(false)
    const [award, setAward] = useState({})
    const [open, setOpen] = useState(false);

    const [
        updateAward,
        {
            isLoading: updatingAward,
            isSuccess: updateAwardSuccess,
            isError: updateAwardFailed,
            error: updateAwardErrorData
        },
    ] = useUpdateAwardMutation()

    const [
        deleteAward,
        {
            isLoading: deletingAward,
            isSuccess: deleteAwardSuccess,
            isError: deleteAwardFailed,
            error: deleteAwardErrorData
        }
    ] = useDeleteAwardMutation()

    const {
        data: fetchedAward,
        isLoading: fetchingAward,
        isSuccess: fetchedAwardSuccess,
        isError: fetchedAwardFailed,
        error: fetchedAwardErrorData
    } = useGetAwardByIdQuery(id, {
        skip: deleteAwardSuccess || isAwardDeleted
    })

    const {
        data: fetchedAwardsWithVolunteerUsage,
        isLoading: fetchingAwardsWithVolunteerUsage,
        isSuccess: fetchedAwardsWithVolunteerUsageSuccess,
        isError: fetchedAwardsWithVolunteerUsageFailed,
        error: fetchedAwardsWithVolunteerUsageErrorData
    } = useGetAwardsWithVolunteerUsageQuery(id, {
        skip: deleteAwardSuccess || isAwardDeleted
    })

    useEffect(() => {
        if (fetchedAwardSuccess) {
            setAward(fetchedAward)
        }
    }, [fetchedAwardSuccess])

    const updateFeedbackDisplay = useUpdateFeedbackDisplay("Award", updatingAward, updateAwardSuccess, updateAwardFailed, updateAwardErrorData)
    const deleteFeedbackDisplay = useDeleteFeedbackDisplay("Award", deletingAward, deleteAwardSuccess, deleteAwardFailed, deleteAwardErrorData)

    useEffect(() => {
        if (updateAwardSuccess) {
            navigate('/dashboard/awards?updated=true')
        }
    }, [updateAwardSuccess])

    useEffect(() => {
        if (deleteAwardSuccess) {
            navigate('/dashboard/awards?deleted=true')
        }
    }, [deleteAwardSuccess])

    const handleNameChange = (e) => {
        setAward(prev => ({ ...prev, name: e.target.value }))
    }

    const handleLengthChange = (e) => {
        setAward(prev => ({ ...prev, requiredServiceLength: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        updateAward(award)
    }

    const handleDelete = async (e) => {
        if (fetchedAwardsWithVolunteerUsageSuccess) {
            if (fetchedAwardsWithVolunteerUsage.isVolunteerUsingAward) {
                setOpen(true);
                return;
            } else {
                deleteAward(id)
                setIsAwardDeleted(true)
            }
        }
    }

    if (fetchingAward || fetchingAwardsWithVolunteerUsage) return (<LoadingTableSkeleton />)
    if (fetchedAwardFailed) return (<BasicError error={fetchedAwardErrorData} />)
    if (fetchedAwardsWithVolunteerUsageFailed) return (<BasicError error={fetchedAwardsWithVolunteerUsageErrorData} />)

    if (fetchedAwardSuccess && fetchedAwardsWithVolunteerUsageSuccess) {
        return (
            <AwardContainer>
                <AlertDialog
                    open={open}
                    setOpen={() => setOpen(!open)}
                    title="Unable to Delete Award"
                    message="Looks like this award is being used by one or more volunteers. Please remove this award from the volunteers before deleting it."
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
                                        value={award.name}
                                        onChange={(e) => handleNameChange(e)}
                                    />
                                </Grid>
                                <Grid item xs={10}>
                                    <TextField
                                        id="requiredServiceLength"
                                        name="requiredServiceLength"
                                        label="Length (Months)"
                                        type="number"
                                        size='small'
                                        required
                                        fullWidth
                                        value={award.requiredServiceLength}
                                        onChange={(e) => handleLengthChange(e)}
                                    />
                                </Grid>
                                <Grid item xs={10} sx={{ textAlign: 'center' }}>
                                    <Button variant="outlined" type="submit">
                                        Update Award
                                    </Button>
                                </Grid>
                                <Grid item xs={10} sx={{ textAlign: 'center' }}>
                                    <Button variant="outlined" onClick={handleDelete}>
                                        Delete Award
                                    </Button>
                                </Grid>
                            </Grid>
                        </FormControl>
                    </Box>
                </Card>
                {updateFeedbackDisplay}
                {deleteFeedbackDisplay}
            </AwardContainer>
        )
    }
}