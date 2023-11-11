import { Button, Card, FormControl, Grid, TextField } from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useAddDocumentMutation } from '../../../lib/apiSlice';
import { useCreateFeedbackDisplay } from '../../../hooks/useCreateFeedbackDisplay';
import { DocumentContainer } from './DocumentContainer';

export function CreateDocument() {
    const navigate = useNavigate();
    const [document, setDocument] = useState({ name: "" })

    const [
        createDocument,
        {
            isLoading: creatingDocument,
            isSuccess: createDocumentSuccess,
            isError: createDocumentFailed,
            error: createDocumentErrorData
        }
    ] = useAddDocumentMutation()

    useEffect(() => {
        if (createDocumentSuccess) {
            navigate('/dashboard/documents?created=true')
        }
    }, [createDocumentSuccess])

    const feedbackDisplay = useCreateFeedbackDisplay('Document', creatingDocument, createDocumentSuccess, createDocumentFailed, createDocumentErrorData)

    const handleNameChange = (e) => {
        setDocument(prev => ({ ...prev, name: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        createDocument(document)
    }

    return (
        <DocumentContainer>
            <Card>
                <Box component="form" onSubmit={handleSubmit}>
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
            {feedbackDisplay}
        </DocumentContainer>
    )
}