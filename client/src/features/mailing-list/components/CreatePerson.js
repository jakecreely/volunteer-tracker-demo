import { Button, Card, Checkbox, FormControl, FormControlLabel, Grid, TextField } from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useAddPersonToMailingListMutation } from '../../../lib/apiSlice';
import { useCreateFeedbackDisplay } from '../../../hooks/useCreateFeedbackDisplay';
import { MailingListContainer } from './MailingListContainer';

export function CreatePerson() {
    const navigate = useNavigate();
    const [person, setPerson] = useState({
        name: "",
        emailAddress: "",
        frequency: null,
        upcomingDays: null,
        subscribed: true
    })

    const [
        addPersonToMailingList,
        {
            isLoading: addingPerson,
            isSuccess: addPersonSuccess,
            isError: addPersonFailed,
            error: addPersonErrorData
        }
    ] = useAddPersonToMailingListMutation()

    useEffect(() => {
        if (addPersonSuccess) {
            navigate('/dashboard/mailing-list?created=true')
        }
    }, [addPersonSuccess])

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
        addPersonToMailingList(person)
    }

    const feedbackDisplay = useCreateFeedbackDisplay('Person', addingPerson, addPersonSuccess, addPersonFailed, addPersonErrorData)

    return (
        <MailingListContainer>
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
                            <Grid item xs={10} textAlign={'center'}>
                                <Button variant="outlined" type="submit">
                                    Add
                                </Button>
                            </Grid>
                        </Grid>
                    </FormControl>
                </Box>
            </Card>
            {feedbackDisplay}
        </MailingListContainer>
    )
}