import { Box, Button, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { TrainingTable } from '../../training/components/TrainingTable'
import { useGetMailingListQuery, useGetTrainingQuery } from '../../../lib/apiSlice'
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusSnackbar } from '../../../components/StatusSnackbar'
import MailingListTable from './MailingListTable'

export default function DisplayMailingListCard() {
    let navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    const {
        data: fetchedMailingList,
        isLoading: fetchedMailingListLoading,
        isSuccess: fetchedMailingListSuccess,
        error: fetchedMailingListError
    } = useGetMailingListQuery()

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Person Added To Mailing List Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('updated') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Person In Mailing List Updated Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('deleted') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Person Deleted From Mailing List Successfully"}
                    statusType={'success'}
                />
            )
        } else {
            setFeedbackDisplay(null)
        }
    }, [searchParams])

    if (fetchedMailingListLoading) return (<LoadingTableSkeleton />)
    if (fetchedMailingListError) return (<div>Error fetching mailing list. Please try again later.</div>)

    if (fetchedMailingListSuccess && fetchedMailingList.length > 0) {
        return (
            <Box>
                <Grid container justifyContent={'center'}>
                    <Grid item xs={12} md={10} lg={10}>
                        <MailingListTable mailingList={fetchedMailingList} />
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
                        <Typography variant='body'>No One In The Mailing List. Why not add someone!</Typography>
                        <br /> <br />
                        <Button variant="outlined" onClick={() => navigate("/dashboard/mailing-list/add")}>
                            Add Person
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        )
    }
}