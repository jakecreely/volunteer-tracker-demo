import { Box, Button, Grid, Typography } from '@mui/material'
import React from 'react'
import { useGetDocumentsQuery } from '../../../features/api/apiSlice'
import { DocumentTable } from '../../../components/tables/DocumentTable'
import { LoadingTableSkeleton } from '../LoadingTableSkeleton'
import { useNavigate } from 'react-router-dom'

export function DisplayDocumentCard() {
    const navigate = useNavigate()

    const {
        data: fetchedDocuments,
        isLoading: fetchedDocumentsLoading,
        isSuccess: fetchedDocumentsSuccess,
        error: fetchedDocumentsError
    } = useGetDocumentsQuery()

    if (fetchedDocumentsLoading) return (<LoadingTableSkeleton />)
    if (fetchedDocumentsError) return (<div>Error! Could not fetch documents.</div>)

    if (fetchedDocumentsSuccess && fetchedDocuments.length > 0) {
        return (
            <Grid container justifyContent={'center'}>
                <Grid item xs={12} md={4}>
                    <DocumentTable documents={fetchedDocuments}/>
                </Grid>
            </Grid>
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