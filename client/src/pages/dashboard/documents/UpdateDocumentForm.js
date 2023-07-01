import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Box, Button, Card, FormControl, Grid, TextField } from '@mui/material';
import { useNavigate } from "react-router-dom";
import AlertDialog from '../../../components/alerts/AlertDialog';
import { useDeleteDocumentMutation, useGetDocumentByIdQuery, useGetVolunteersQuery, useUpdateDocumentMutation } from '../../../features/api/apiSlice';
import { LoadingTableSkeleton } from '../LoadingTableSkeleton';

export function UpdateDocumentForm(props) {
    let navigate = useNavigate();

    const { id } = useParams();

    const {
        data: fetchedDocument,
        isLoading: fetchedDocumentLoading,
        isSuccess: fetchedDocumentSuccess,
        error: fetchedDocumentError
    } = useGetDocumentByIdQuery(id)

    const {
        data: fetchedVolunteers,
        isLoading: fetchedVolunteersLoading,
        isSuccess: fetchedVolunteersSuccess,
        error: fetchedVolunteersError
    } = useGetVolunteersQuery()

    const [
        updateDocument,
        { 
            isLoading: isUpdating,
            isSuccess: updateSuccess
        },
    ] = useUpdateDocumentMutation()

    const [
        deleteDocument,
        { 
            isLoading: isDeleting,
            isSuccess: deleteSuccess
        }
    ] = useDeleteDocumentMutation()

    let [document, setDocument] = useState({})
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (fetchedDocumentSuccess) {
            setDocument(fetchedDocument)
        }
    }, [fetchedDocumentSuccess])

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
        console.log("Submitting form", document)
        updateDocument(document)
    }

    useEffect(() => {
        if (updateSuccess) {
            navigate('/dashboard/documents')
        }
    }, [updateSuccess])

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
            console.log("Delete")
            deleteDocument(id)
        } else {
            setOpen(true);
        }
    }

    useEffect(() => {
        if (deleteSuccess) {
            navigate('/dashboard/documents')
        }
    }, [deleteSuccess])

    if (fetchedDocumentLoading || fetchedVolunteersLoading) return (<LoadingTableSkeleton />)

    if (fetchedDocumentSuccess && fetchedVolunteersSuccess) {
        return (
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
            </Grid >
        )
    }
}