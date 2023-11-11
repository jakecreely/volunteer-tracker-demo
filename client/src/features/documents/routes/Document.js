import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Box, Button, Card, FormControl, Grid, TextField } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { AlertDialog } from '../../../components/AlertDialog';
import { useDeleteDocumentMutation, useGetDocumentByIdQuery, useGetDocumentWithVolunteerUsageQuery, useGetVolunteersQuery, useUpdateDocumentMutation } from '../../../lib/apiSlice';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton'
import { useUpdateFeedbackDisplay } from '../../../hooks/useUpdateFeedbackDisplay';
import { useDeleteFeedbackDisplay } from '../../../hooks/useDeleteFeedbackDisplay';
import { BasicError } from '../../../components/BasicError';
import { DocumentContainer } from '../components/DocumentContainer';

export function Document() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isDocumentDeleted, setIsDocumentDeleted] = useState(false)
    const [document, setDocument] = useState({})
    const [open, setOpen] = useState(false);

    const [
        updateDocument,
        {
            isLoading: updatingDocument,
            isSuccess: updateDocumentSuccess,
            isError: updateDocumentFailed,
            error: updateDocumentErrorData
        },
    ] = useUpdateDocumentMutation()

    const [
        deleteDocument,
        {
            isLoading: deletingDocument,
            isSuccess: deleteDocumentSuccess,
            isError: deleteDocumentFailed,
            error: deleteDocumentErrorData
        }
    ] = useDeleteDocumentMutation()

    const {
        data: fetchedDocument,
        isLoading: fetchingDocument,
        isSuccess: fetchedDocumentSuccess,
        isError: fetchedDocumentFailed,
        error: fetchedDocumentErrorData,
    } = useGetDocumentByIdQuery(id, {
        skip: deleteDocumentSuccess || isDocumentDeleted
    })

    const {
        data: fetchedDocumentWithVolunteerUsage,
        isLoading: fetchingDocumentWithVolunteerUsage,
        isSuccess: fetchedDocumentWithVolunteerUsageSuccess,
        isError: fetchedDocumentWithVolunteerUsageFailed,
        error: fetchedDocumentWithVolunteerUsageErrorData
    } = useGetDocumentWithVolunteerUsageQuery(id, {
        skip: deleteDocumentSuccess || isDocumentDeleted
    })

    useEffect(() => {
        if (fetchedDocumentSuccess) {
            setDocument(fetchedDocument)
        }
    }, [fetchedDocumentSuccess])

    useEffect(() => {
        if (updateDocumentSuccess) {
            navigate('/dashboard/documents?updated=true')
        }
    }, [updateDocumentSuccess])

    useEffect(() => {
        if (deleteDocumentSuccess) {
            navigate('/dashboard/documents?deleted=true')
        }
    }, [deleteDocumentSuccess])

    const handleNameChange = (e) => {
        setDocument(prev => ({ ...prev, name: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        updateDocument(document)
    }

    const handleDelete = async (e) => {
        if (fetchedDocumentWithVolunteerUsageSuccess) {
            if (fetchedDocumentWithVolunteerUsage.isVolunteerUsingDocument) {
                setOpen(true)
                return
            } else {
                deleteDocument(id)
                setIsDocumentDeleted(true)
            }
        }
    }

    const updateFeedbackDisplay = useUpdateFeedbackDisplay('Document', updatingDocument, updateDocumentSuccess, updateDocumentFailed, updateDocumentErrorData)
    const deleteFeedbackDisplay = useDeleteFeedbackDisplay('Document', deletingDocument, deleteDocumentSuccess, deleteDocumentFailed, deleteDocumentErrorData)

    if (fetchingDocument || fetchingDocumentWithVolunteerUsage) return (<LoadingTableSkeleton />)
    if (fetchedDocumentFailed) return (<BasicError error={fetchedDocumentErrorData} />)
    if (fetchedDocumentWithVolunteerUsageFailed) return (<BasicError error={fetchedDocumentWithVolunteerUsageErrorData} />)

    if (fetchedDocumentSuccess && fetchedDocumentWithVolunteerUsageSuccess) {
        return (
            <DocumentContainer>
                <AlertDialog
                    open={open}
                    setOpen={() => setOpen(!open)}
                    title="Unable to Delete Document"
                    message="Looks like this document is being used by one or more volunteers. Please remove this award from the volunteers before deleting it."
                    closeMessage="Close"
                />
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
                                        value={document.name}
                                        onChange={(e) => handleNameChange(e)}
                                    />
                                </Grid>
                                <Grid item xs={10} textAlign={'center'}>
                                    <Button variant="outlined" type="submit">
                                        Update Document
                                    </Button>
                                </Grid>
                                <Grid item xs={10} textAlign={'center'}>
                                    <Button variant="outlined" onClick={handleDelete}>
                                        Delete Document
                                    </Button>
                                </Grid>
                            </Grid>
                        </FormControl>
                    </Box>
                </Card>
                {updateFeedbackDisplay}
                {deleteFeedbackDisplay}
            </DocumentContainer>
        )
    }
}