import { Button, Card, FormControl, Grid, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useAddAwardMutation } from '../../../features/api/apiSlice';

export function CreateAwardForm(props) {

    const [
        createAward,
        { isLoading: isCreating,
            isSuccess: createSuccess
        }
    ] = useAddAwardMutation()

    let navigate = useNavigate();

    let [award, setAward] = useState({
        name: "",
        requiredServiceLength: null
    })

    const handleNameChange = (e) => {
        setAward(prev => {
            return {
                ...prev,
                name: e.target.value
            }
        })
    }

    const handleLengthChange = (e) => {
        setAward(prev => {
            return {
                ...prev,
                requiredServiceLength: e.target.value
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        createAward(award)
    }

    useEffect(() => {
        if (createSuccess) {
            navigate('/dashboard/awards')
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
                        <FormControl>
                            <Grid container justifyContent={'center'} p={2} spacing={2}>
                                <Grid item xs={10}>
                                    <TextField
                                        id="name"
                                        name="name"
                                        label="Name"
                                        size='small'
                                        required
                                        fullWidth
                                        value={award.name}
                                        onChange={(e) => handleNameChange(e)}
                                    />
                                </Grid>
                                <Grid item xs={10}>
                                    <TextField
                                        id="requiredServiceLength"
                                        name="requiredServiceLength"
                                        label="Length (Months)"
                                        type="number"
                                        size='small'
                                        required
                                        fullWidth
                                        value={award.requiredServiceLength}
                                        onChange={(e) => handleLengthChange(e)}
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