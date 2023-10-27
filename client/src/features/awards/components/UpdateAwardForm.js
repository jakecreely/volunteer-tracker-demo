import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Box, Button, Card, FormControl, Grid, TextField } from '@mui/material';
import { useNavigate } from "react-router-dom";
import AlertDialog from '../../../components/AlertDialog';
import { useDeleteAwardMutation, useGetAwardByIdQuery, useGetVolunteersQuery, useUpdateAwardMutation } from '../../../lib/apiSlice';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { StatusSnackbar } from '../../../components/StatusSnackbar';

export default function UpdateAwardForm(props) {
    let navigate = useNavigate();

    const { id } = useParams();
    const [isAwardDeleted, setIsAwardDeleted] = useState(false)
    let [award, setAward] = useState({})
    const [open, setOpen] = useState(false);
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    const [
        updateAward,
        {
            isLoading: isUpdating,
            isSuccess: updateSuccess,
            isError: isUpdateError,
            error: updateError
        },
    ] = useUpdateAwardMutation()

    const [
        deleteAward,
        {
            isLoading: isDeleting,
            isSuccess: deleteSuccess,
            isError: isDeleteError,
            error: deleteError
        }
    ] = useDeleteAwardMutation()

    const {
        data: fetchedAward,
        isLoading: fetchedAwardLoading,
        isSuccess: fetchedAwardSuccess,
        error: fetchedAwardError
    } = useGetAwardByIdQuery(id, {
        skip: deleteSuccess || isAwardDeleted
    })

    const {
        data: fetchedVolunteers,
        isLoading: fetchedVolunteersLoading,
        isSuccess: fetchedVolunteersSuccess,
        error: fetchedVolunteersError
    } = useGetVolunteersQuery()

    useEffect(() => {
        if (fetchedAwardSuccess) {
            setAward(fetchedAward)
        }
    }, [fetchedAwardSuccess])

    useEffect(() => {
        if (isUpdating) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Updating Award... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isUpdating])

    useEffect(() => {
        if (isUpdateError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Updating Award Failed!"}
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
                    statusTitle={"Deleting Award... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isDeleting])

    useEffect(() => {
        if (isDeleteError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Deleting Award Failed!"}
                    errorMessage={deleteError.data}
                    statusType={"error"}
                />
            )
        }
    }, [isDeleteError])

    const handleNameChange = (e) => {
        setAward(prev => {
            return {
                ...prev,
                name: e.target.value
            }
        })
    }

    const handleLengthChange = (e) => {
        setAward(prev => {
            return {
                ...prev,
                requiredServiceLength: e.target.value
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        updateAward(award)
    }

    useEffect(() => {
        if (updateSuccess) {
            navigate('/dashboard/awards?updated=true')
        }
    }, [updateSuccess])

    const handleDelete = async (e) => {
        const seeIfAwardIsUsedByVolunteer = () => {
            let volunteersUsingAwards = fetchedVolunteers.filter(volunteer => {
                let awardIds = []
                volunteer.awards.map(volunteerAward => {
                    if (volunteerAward.awardId === id) {
                        awardIds.push(id)
                    }
                })
                return awardIds.includes(id)
            })

            if (volunteersUsingAwards.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        if (!seeIfAwardIsUsedByVolunteer()) {
            deleteAward(id)
            setIsAwardDeleted(true)
        } else {
            setOpen(true);
        }
    }

    useEffect(() => {
        if (deleteSuccess) {
            navigate('/dashboard/awards?deleted=true')
        }
    }, [deleteSuccess])

    if (fetchedAwardLoading || fetchedVolunteersLoading) return (<LoadingTableSkeleton />)

    if (fetchedAwardSuccess && fetchedVolunteersSuccess) {
        return (
            <Box>
                <Grid container justifyContent={'center'} >
                    <AlertDialog
                        open={open}
                        setOpen={() => setOpen(!open)}
                        title="Unable to Delete Award"
                        message="Looks like this award is being used by one or more volunteers. Please remove this award from the volunteers before deleting it."
                        closeMessage="Close"
                    />
                    <Grid item xs={12} md={4}>
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
                    </Grid>
                </Grid>
                {feedbackDisplay}
            </Box>
        )
    }
}