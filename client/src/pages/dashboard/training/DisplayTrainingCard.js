import { Box, Button, Grid, Typography } from '@mui/material'
import React from 'react'
import { TrainingTable } from '../../../components/tables/TrainingTable'
import { useGetTrainingQuery } from '../../../features/api/apiSlice'
import { LoadingTableSkeleton } from '../LoadingTableSkeleton'
import { useNavigate } from 'react-router-dom'

export function DisplayTrainingCard() {
    let navigate = useNavigate();

    const {
        data: fetchedTraining,
        isLoading: fetchedTrainingLoading,
        isSuccess: fetchedTrainingSuccess,
        error: fetchedTrainingError
    } = useGetTrainingQuery()

    if (fetchedTrainingLoading) return (<LoadingTableSkeleton />)
    if (fetchedTrainingError) return (<div>Error! Could not fetch training.</div>)

    if (fetchedTrainingSuccess && fetchedTraining.length > 0) {
        return (
            <Grid container justifyContent={'center'}>
                <Grid item xs={12} md={10} lg={8}>
                    <TrainingTable training={fetchedTraining} />
                </Grid>
            </Grid>
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