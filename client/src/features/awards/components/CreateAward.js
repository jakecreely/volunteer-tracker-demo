import { Button, Card, FormControl, Grid, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useAddAwardMutation } from '../../../lib/apiSlice';
import { StatusSnackbar } from '../../../components/StatusSnackbar';
import { useCreateFeedbackDisplay } from '../../../hooks/useCreateFeedbackDisplay';
import { AwardContainer } from './AwardContainer';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { BasicError } from '../../../components/BasicError';

export function CreateAward() {
    const navigate = useNavigate();
    const [award, setAward] = useState({
        name: "",
        requiredServiceLength: null
    })

    const [
        createAward,
        {
            isLoading: creatingAward,
            isSuccess: createAwardSuccess,
            isError: createAwardFailed,
            error: createAwardErrorData
        }
    ] = useAddAwardMutation()

    useEffect(() => {
        if (createAwardSuccess) {
            navigate('/dashboard/awards?created=true')
        }
    }, [createAwardSuccess])

    const feedbackDisplay = useCreateFeedbackDisplay('Award', creatingAward, createAwardSuccess, createAwardFailed, createAwardErrorData)

    const handleNameChange = (e) => {
        setAward(prev => ({ ...prev, name: e.target.value }))
    }

    const handleLengthChange = (e) => {
        setAward(prev => ({ ...prev, requiredServiceLength: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        createAward(award)
    }

    return (
        <AwardContainer>
            <Card>
                <Box component="form" onSubmit={handleSubmit}>
                    <FormControl>
                        <Grid container justifyContent={'center'} p={2} spacing={2}>
                            <Grid item xs={10}>
                                <TextField
                                    id="name"
                                    name="name"
                                    label="Name"
                                    size='small'
                                    required
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
                            <Grid item xs={10} textAlign={'center'}>
                                <Button variant="outlined" type="submit">
                                    Create
                                </Button>
                            </Grid>
                        </Grid>
                    </FormControl>
                </Box>
            </Card>
            {feedbackDisplay}
        </AwardContainer>
    )
}