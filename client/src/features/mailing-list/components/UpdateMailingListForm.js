import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Box, Button, Card, Checkbox, Chip, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useNavigate } from "react-router-dom";
import AlertDialog from '../../../components/AlertDialog';
import { useDeletePersonOnMailingListMutation, useGetPersonOnMailingListByIdQuery, useUpdatePersonOnMailingListMutation } from '../../../lib/apiSlice';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { StatusSnackbar } from '../../../components/StatusSnackbar';

export default function UpdateMailingListForm(props) {
    let navigate = useNavigate();

    const { id } = useParams();
    const [isPersonDeleted, setIsPersonDeleted] = useState(false)
    let [person, setPerson] = useState(null)
    let [personSuccess, setPersonSuccess] = useState(false)
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    const [
        updatePersonOnMailingList,
        {
            isLoading: isUpdating,
            isSuccess: updateSuccess,
            isError: isUpdateError,
            error: updateError
        }
    ] = useUpdatePersonOnMailingListMutation()

    const [
        deletePersonOnMailingList,
        {
            isLoading: isDeleting,
            isSuccess: deleteSuccess,
            isError: isDeleteError,
            error: deleteError
        }
    ] = useDeletePersonOnMailingListMutation()

    const {
        data: fetchedPerson,
        isLoading: fetchedPersonLoading,
        isSuccess: fetchedPersonSuccess,
        error: fetchedPersonError
    } = useGetPersonOnMailingListByIdQuery(id, {
        skip: deleteSuccess || isPersonDeleted
    })

    useEffect(() => {
        if (isUpdating) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Updating Person... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isUpdating])

    useEffect(() => {
        if (isUpdateError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Updating Person Failed!"}
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
                    statusTitle={"Deleting Person... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isDeleting])

    useEffect(() => {
        if (isDeleteError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Deleting Person Failed!"}
                    errorMessage={deleteError.data}
                    statusType={"error"}
                />
            )
        }
    }, [isDeleteError])

    useEffect(() => {
        if (fetchedPersonSuccess) {
            setPerson(fetchedPerson)
            setPersonSuccess(true)
        }
    }, [fetchedPersonSuccess])

    const handleNameChange = (e) => {
        setPerson(prev => {
            return {
                ...prev,
                name: e.target.value
            }
        })
    }

    const handleEmailAddressChange = (e) => {
        setPerson(prev => {
            return {
                ...prev,
                emailAddress: e.target.value
            }
        })
    }

    const handleFrequencyChange = (e) => {
        setPerson(prev => {
            return {
                ...prev,
                frequency: e.target.value
            }
        })
    }

    const handleUpcomingDaysChange = (e) => {
        setPerson(prev => {
            return {
                ...prev,
                upcomingDays: e.target.value
            }
        })
    }

    const handleSubscribedChange = (e) => {
        setPerson(prev => {
            return {
                ...prev,
                subscribed: e.target.checked // Change to checked?
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // let localTraining = JSON.parse(JSON.stringify(training))
        updatePersonOnMailingList(person)
    }

    useEffect(() => {
        if (updateSuccess) {
            navigate('/dashboard/mailing-list?updated=true')
        }
    }, [updateSuccess])

    const handleDelete = async (e) => {
        deletePersonOnMailingList(id)
        setIsPersonDeleted(true)
    }

    useEffect(() => {
        if (deleteSuccess) {
            navigate('/dashboard/mailing-list?deleted=true')
        }
    }, [deleteSuccess])

    if (fetchedPersonLoading) return (<LoadingTableSkeleton />)
    if (fetchedPersonError) return <div>Error</div>

    if (personSuccess && fetchedPersonSuccess) {
        return (
            <Box>
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
                                                required
                                                size="small"
                                                fullWidth
                                                value={person.name}
                                                onChange={(e) => handleNameChange(e)}
                                            />
                                        </Grid>
                                        <Grid item xs={10}>
                                            <TextField
                                                id="emailAddress"
                                                name="emailAddress"
                                                label="Email Address"
                                                size="small"
                                                required
                                                fullWidth
                                                value={person.emailAddress}
                                                onChange={(e) => handleEmailAddressChange(e)}
                                            />
                                        </Grid>
                                        <Grid item xs={10}>
                                            <TextField
                                                id="frequency"
                                                name="frequency"
                                                label="Email Frequency (Days)"
                                                type="number"
                                                size="small"
                                                required
                                                fullWidth
                                                value={person.frequency}
                                                onChange={(e) => handleFrequencyChange(e)}
                                            />
                                        </Grid>
                                        <Grid item xs={10}>
                                            <TextField
                                                id="upcomingDays"
                                                name="upcomingDays"
                                                label="Days To Search Ahead By"
                                                type="number"
                                                size="small"
                                                required
                                                fullWidth
                                                value={person.upcomingDays}
                                                onChange={(e) => handleUpcomingDaysChange(e)}
                                            />
                                        </Grid>
                                        <Grid item xs={10}>
                                            <FormControlLabel control={<Checkbox
                                                id="subscribed"
                                                name="subscribed"
                                                size="small"
                                                fullWidth
                                                checked={person.subscribed}
                                                onChange={(e) => handleSubscribedChange(e)}
                                            />} label="Subscribed" />
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