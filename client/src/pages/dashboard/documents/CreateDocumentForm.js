import { Button, Card, FormControl, Grid, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useAddDocumentMutation } from '../../../features/api/apiSlice';

export function CreateDocumentForm(props) {

    const [
        createDocument,
        { 
            isLoading: isCreating,
            isSuccess: createSuccess
        }
    ] = useAddDocumentMutation()

    let navigate = useNavigate();

    let [document, setDocument] = useState({
        name: "",
    })

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
        createDocument(document)
    }

    useEffect(() => {
        if (createSuccess) {
            navigate('/dashboard/documents')
        }
    }, [createSuccess])

    return (
        <Grid container justifyContent={'center'} >
            <Grid item xs={12} md={4}>
                <Card>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        <FormControl fullWidth>
                            <Grid container justifyContent={'center'} p={2} spacing={2}>
                                <Grid item xs={10}>
                                    <TextField
                                        id="name"
                                        name="name"
                                        label="Name"
                                        required
                                        size='small'
                                        fullWidth
                                        value={document.name}
                                        onChange={(e) => handleNameChange(e)}
                                    />
                                </Grid>
                                <Grid item xs={10} textAlign={'center'}>
                                    <Button variant="outlined" type="submit">
                                        Create
                                    </Button>
                                </Grid>
                            </Grid>
                        </FormControl>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    )
}