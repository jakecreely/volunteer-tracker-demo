import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Box, Button, Card, FormControl, Grid, TextField } from '@mui/material';
import { useNavigate } from "react-router-dom";
import AlertDialog from '../../../components/AlertDialog';
import { useDeleteDocumentMutation, useGetDocumentByIdQuery, useGetVolunteersQuery, useUpdateDocumentMutation } from '../../../lib/apiSlice';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton'
import { StatusSnackbar } from '../../../components/StatusSnackbar';

export default function UpdateDocumentForm(props) {
    let navigate = useNavigate();

    const { id } = useParams();
    const [isDocumentDeleted, setIsDocumentDeleted] = useState(false)
    let [document, setDocument] = useState({})
    const [open, setOpen] = useState(false);
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    const [
        updateDocument,
        {
            isLoading: isUpdating,
            isSuccess: updateSuccess,
            isError: isUpdateError,
            error: updateError
        },
    ] = useUpdateDocumentMutation()

    const [
        deleteDocument,
        {
            isLoading: isDeleting,
            isSuccess: deleteSuccess,
            isError: isDeleteError,
            error: deleteError
        }
    ] = useDeleteDocumentMutation()

    const {
        data: fetchedDocument,
        isLoading: fetchedDocumentLoading,
        isSuccess: fetchedDocumentSuccess,
        error: fetchedDocumentError,
    } = useGetDocumentByIdQuery(id, {
        skip: deleteSuccess || isDocumentDeleted
    })

    const {
        data: fetchedVolunteers,
        isLoading: fetchedVolunteersLoading,
        isSuccess: fetchedVolunteersSuccess,
        error: fetchedVolunteersError
    } = useGetVolunteersQuery()

    useEffect(() => {
        if (fetchedDocumentSuccess) {
            setDocument(fetchedDocument)
        }
    }, [fetchedDocumentSuccess])

    useEffect(() => {
        if (isUpdating) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Updating Document... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isUpdating])

    useEffect(() => {
        if (isUpdateError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Updating Document Failed!"}
                    errorMessage={updateError.data}
                    statusType={"error"}
                />
            )
        }
    }, [isUpdateError])

    useEffect(() => {
        if (isDeleting) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Deleting Document... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isDeleting])

    useEffect(() => {
        if (isDeleteError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Deleting Document Failed!"}
                    errorMessage={deleteError.data}
                    statusType={"error"}
                />
            )
        }
    }, [isDeleteError])

    useEffect(() => {
        if (updateSuccess) {
            navigate('/dashboard/documents?updated=true')
        }
    }, [updateSuccess])

    useEffect(() => {
        if (deleteSuccess) {
            navigate('/dashboard/documents?deleted=true')
        }
    }, [deleteSuccess])

    const handleNameChange = (e) => {
        setDocument(prev => {
            return {
                ...prev,
                name: e.target.value
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        updateDocument(document)
    }

    const handleDelete = async (e) => {
        const seeIfDocumentIsUsedByVolunteer = () => {
            let volunteersUsingDocuments = fetchedVolunteers.filter(volunteer => {
                let documentIds = []
                volunteer.documents.map(volunteerDocument => {
                    if (volunteerDocument.documentId === id) {
                        documentIds.push(id)
                    }
                })
                return documentIds.includes(id)
            })

            if (volunteersUsingDocuments.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        if (!seeIfDocumentIsUsedByVolunteer()) {
            deleteDocument(id)
            setIsDocumentDeleted(true)
        } else {
            setOpen(true);
        }
    }

    if (fetchedDocumentLoading || fetchedVolunteersLoading) return (<LoadingTableSkeleton />)

    if (fetchedDocumentSuccess && fetchedVolunteersSuccess) {
        return (
            <Box>
                <Grid container justifyContent={'center'} >
                    <AlertDialog
                        open={open}
                        setOpen={() => setOpen(!open)}
                        title="Unable to Delete Document"
                        message="Looks like this document is being used by one or more volunteers. Please remove this award from the volunteers before deleting it."
                        closeMessage="Close"
                    />
                    <Grid item xs={12} md={4}>
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
                    </Grid>
                </Grid>
                {feedbackDisplay}
            </Box>
        )
    }
}