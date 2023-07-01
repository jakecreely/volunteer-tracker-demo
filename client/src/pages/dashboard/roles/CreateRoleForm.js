import { Button, Card, FormControl, Grid, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useAddRoleMutation } from '../../../features/api/apiSlice';

export function CreateRoleForm(props) {

    const [
        createRole,
        { 
            isLoading: isCreating,
            isSuccess: createSuccess
        }
    ] = useAddRoleMutation()

    let navigate = useNavigate();

    let [role, setRole] = useState({
        name: "",
    })

    const handleNameChange = (e) => {
        setRole(prev => {
            return {
                ...prev,
                name: e.target.value
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        createRole(role)
    }

    useEffect(() => {
        if (createSuccess) {
            console.log("Successfully created role")
            navigate('/dashboard/roles')
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
                                        size="small"
                                        fullWidth
                                        value={role.name}
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