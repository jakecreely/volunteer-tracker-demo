import { Box, Button, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import TrainingTable from './TrainingTable'
import { useGetTrainingQuery } from '../../../lib/apiSlice'
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusSnackbar } from '../../../components/StatusSnackbar'

export default function DisplayTrainingCard() {
    let navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    const {
        data: fetchedTraining,
        isLoading: fetchedTrainingLoading,
        isSuccess: fetchedTrainingSuccess,
        error: fetchedTrainingError
    } = useGetTrainingQuery()

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Training Created Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('updated') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Training Updated Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('deleted') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Training Deleted Successfully"}
                    statusType={'success'}
                />
            )
        } else {
            setFeedbackDisplay(null)
        }
    }, [searchParams])

    if (fetchedTrainingLoading) return (<LoadingTableSkeleton />)
    if (fetchedTrainingError) return (<div>Error fetching training. Please try again later.</div>)

    if (fetchedTrainingSuccess && fetchedTraining.length > 0) {
        return (
            <Box>
                <Grid container justifyContent={'center'}>
                    <Grid item xs={12} md={10} lg={8}>
                        <TrainingTable training={fetchedTraining} />
                    </Grid>
                </Grid>
                {feedbackDisplay}
            </Box>
        )
    } else {
        return (
            <Grid container justifyContent={'center'}>
                <Grid item xs={12} md={10} lg={8}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant='body'>No Training. Why not add one!</Typography>
                        <br /> <br />
                        <Button variant="outlined" onClick={() => navigate("/dashboard/training/create")}>
                            Create Training
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        )
    }
}