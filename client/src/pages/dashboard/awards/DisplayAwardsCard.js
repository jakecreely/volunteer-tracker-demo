import { Box, Button, Grid, Typography } from '@mui/material'
import React from 'react'
import { AwardTable } from '../../../components/tables/AwardTable'
import { useGetAwardsQuery } from '../../../features/api/apiSlice'
import { LoadingTableSkeleton } from '../LoadingTableSkeleton'
import { useNavigate } from 'react-router-dom'

export function DisplayAwardCard(props) {
    const navigate = useNavigate()

    const {
        data: fetchedAwards,
        isLoading: fetchedAwardsLoading,
        isSuccess: fetchedAwardsSuccess,
        error: fetchedAwardsError
    } = useGetAwardsQuery()

    if (fetchedAwardsLoading) {
        return (
            <LoadingTableSkeleton />
        )
    }

    if (fetchedAwardsError) return (<div>Error! Could not fetch awards.</div>)

    if (fetchedAwardsSuccess && fetchedAwards.length > 0) {
        return (
            <Grid container justifyContent={'center'}>
                <Grid item xs={12} md={6} lg={4}>
                    <AwardTable awards={fetchedAwards}/>
                </Grid>
            </Grid>
        )
    } else {
        return (
            <Grid container justifyContent={'center'}>
                <Grid item xs={12} md={10} lg={8}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant='body'>No Awards Here. Why not add one!</Typography>
                    <br /> <br />
                    <Button variant="outlined" onClick={() => navigate("/dashboard/awards/create")}>
                        Create Award
                    </Button>
                    </Box>
                </Grid>
            </Grid>
        )
    }
}