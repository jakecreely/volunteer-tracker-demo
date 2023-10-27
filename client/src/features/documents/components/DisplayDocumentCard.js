import { Box, Button, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useGetDocumentsQuery } from '../../../lib/apiSlice'
import DocumentTable from './DocumentTable'
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusSnackbar } from '../../../components/StatusSnackbar'

export default function DisplayDocumentCard() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    const {
        data: fetchedDocuments,
        isLoading: fetchedDocumentsLoading,
        isSuccess: fetchedDocumentsSuccess,
        error: fetchedDocumentsError
    } = useGetDocumentsQuery()

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Document Created Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('updated') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Document Updated Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('deleted') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Document Deleted Successfully"}
                    statusType={'success'}
                />
            )
        } else {
            setFeedbackDisplay(null)
        }
    }, [searchParams])

    if (fetchedDocumentsLoading) return (<LoadingTableSkeleton />)
    if (fetchedDocumentsError) return (<div>Error fetching documents. Please try again later.</div>)

    if (fetchedDocumentsSuccess && fetchedDocuments.length > 0) {
        return (
            <Box>
                <Grid container justifyContent={'center'}>
                    <Grid item xs={12} md={4}>
                        <DocumentTable documents={fetchedDocuments} />
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
                        <Typography variant='body'>No Documents. Why not add one!</Typography>
                        <br /> <br />
                        <Button variant="outlined" onClick={() => navigate("/dashboard/documents/create")}>
                            Create Document
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        )
    }
}