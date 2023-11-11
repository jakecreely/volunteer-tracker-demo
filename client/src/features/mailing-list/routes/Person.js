import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Box, Button, Card, Checkbox, FormControl, FormControlLabel, Grid, TextField } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useDeletePersonOnMailingListMutation, useGetPersonOnMailingListByIdQuery, useUpdatePersonOnMailingListMutation } from '../../../lib/apiSlice';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { useUpdateFeedbackDisplay } from '../../../hooks/useUpdateFeedbackDisplay';
import { BasicError } from '../../../components/BasicError';
import { MailingListContainer } from '../components/MailingListContainer';

export function Person() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isPersonDeleted, setIsPersonDeleted] = useState(false)
    const [person, setPerson] = useState(null)
    const [personSuccess, setPersonSuccess] = useState(false)

    const [
        updatePersonOnMailingList,
        {
            isLoading: updatingPerson,
            isSuccess: updatePersonSuccess,
            isError: updatePersonFailed,
            error: updatePersonErrorData
        }
    ] = useUpdatePersonOnMailingListMutation()

    const [
        deletePersonOnMailingList,
        {
            isLoading: deletingPerson,
            isSuccess: deletePersonSuccess,
            isError: deletePersonFailed,
            error: deletePersonErrorData
        }
    ] = useDeletePersonOnMailingListMutation()

    const {
        data: fetchedPerson,
        isLoading: fetchingPerson,
        isSuccess: fetchedPersonSuccess,
        isError: fetchedPersonFailed,
        error: fetchedPersonErrorData
    } = useGetPersonOnMailingListByIdQuery(id, {
        skip: deletePersonSuccess || isPersonDeleted
    })

    const updateFeedbackDisplay = useUpdateFeedbackDisplay('Person', updatingPerson, updatePersonSuccess, updatePersonFailed, updatePersonErrorData)
    const deleteFeedbackDisplay = useUpdateFeedbackDisplay('Person', deletingPerson, deletePersonSuccess, deletePersonFailed, deletePersonErrorData)

    useEffect(() => {
        if (deletePersonSuccess) {
            navigate('/dashboard/mailing-list?deleted=true')
        }
    }, [deletePersonSuccess])

    useEffect(() => {
        if (updatePersonSuccess) {
            navigate('/dashboard/mailing-list?updated=true')
        }
    }, [updatePersonSuccess])

    useEffect(() => {
        if (deletePersonSuccess) {
            navigate('/dashboard/mailing-list?deleted=true')
        }
    }, [deletePersonSuccess])

    useEffect(() => {
        if (fetchedPersonSuccess) {
            setPerson(fetchedPerson)
            setPersonSuccess(true)
        }
    }, [fetchedPersonSuccess])

    const handleNameChange = (e) => {
        setPerson(prev => ({ ...prev, name: e.target.value }))
    }

    const handleEmailAddressChange = (e) => {
        setPerson(prev => ({ ...prev, emailAddress: e.target.value }))
    }

    const handleFrequencyChange = (e) => {
        setPerson(prev => ({ ...prev, frequency: e.target.value }))
    }

    const handleUpcomingDaysChange = (e) => {
        setPerson(prev => ({ ...prev, upcomingDays: e.target.value }))
    }

    const handleSubscribedChange = (e) => {
        setPerson(prev => ({ ...prev, subscribed: e.target.checked }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        updatePersonOnMailingList(person)
    }

    const handleDelete = async (e) => {
        deletePersonOnMailingList(id)
        setIsPersonDeleted(true)
    }

    if (fetchingPerson) return (<LoadingTableSkeleton />)
    if (fetchedPersonFailed) return <BasicError error={fetchedPersonErrorData.data} />

    if (personSuccess && fetchedPersonSuccess) {
        return (
            <MailingListContainer>
                <Card>
                    <Box component="form" onSubmit={handleSubmit}>
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
                {updateFeedbackDisplay}
                {deleteFeedbackDisplay}
            </MailingListContainer>
        )
    }
}