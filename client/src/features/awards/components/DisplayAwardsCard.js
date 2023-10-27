import { Box, Button, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { AwardTable } from '../../../features/awards'
import { useGetAwardsQuery } from '../../../lib/apiSlice'
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusSnackbar } from '../../../components/StatusSnackbar'

export default function DisplayAwardCard(props) {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    const {
        data: fetchedAwards,
        isLoading: fetchedAwardsLoading,
        isSuccess: fetchedAwardsSuccess,
        error: fetchedAwardsError
    } = useGetAwardsQuery()

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Award Created Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('updated') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Award Updated Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('deleted') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Award Deleted Successfully"}
                    statusType={'success'}
                />
            )
        } else {
            setFeedbackDisplay(null)
        }
    }, [searchParams])

    if (fetchedAwardsLoading) {
        return (
            <LoadingTableSkeleton />
        )
    }

    if (fetchedAwardsError) return (<div>Error fetching awards. Please try again later.</div>)

    if (fetchedAwardsSuccess && fetchedAwards.length > 0) {
        return (
            <Box>
                <Grid container justifyContent={'center'}>
                    <Grid item xs={12} md={6} lg={5}>
                        <AwardTable awards={fetchedAwards} />
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