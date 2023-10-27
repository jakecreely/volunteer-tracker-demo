import { Button, Card, Checkbox, FormControl, FormControlLabel, Grid, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useAddPersonToMailingListMutation } from '../../../lib/apiSlice';
import { StatusSnackbar } from '../../../components/StatusSnackbar';

export default function CreateMailingListForm(props) {
    let navigate = useNavigate();

    const [
        addPersonToMailingList,
        {
            isLoading: isAdding,
            isSuccess: addSuccess,
            isError: isErrorAdding,
            error: addError
        }
    ] = useAddPersonToMailingListMutation()

    const [person, setPerson] = useState({
        name: "",
        emailAddress: "",
        frequency: null,
        upcomingDays: null,
        subscribed: true
    })

    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    useEffect(() => {
        if (isAdding) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Creating Person... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isAdding])

    useEffect(() => {
        if (isErrorAdding) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Person Creation Failed!"}
                    errorMessage={addError.data}
                    statusType={"error"}
                />
            )
        }
    }, [isErrorAdding])

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
        addPersonToMailingList(person)
    }

    useEffect(() => {
        if (addSuccess) {
            navigate('/dashboard/mailing-list?created=true')
        }
    }, [addSuccess])

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
                                    <Grid item xs={10} textAlign={'center'}>
                                        <Button variant="outlined" type="submit">
                                            Add
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