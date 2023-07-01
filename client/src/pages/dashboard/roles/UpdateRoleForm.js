import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Box, Button, Card, FormControl, Grid, TextField } from '@mui/material';
import { useNavigate } from "react-router-dom";
import AlertDialog from '../../../components/alerts/AlertDialog';
import { useDeleteRoleMutation, useGetRoleByIdQuery, useGetVolunteersQuery, useUpdateRoleMutation } from '../../../features/api/apiSlice';
import { LoadingTableSkeleton } from '../LoadingTableSkeleton';

export function UpdateRoleForm(props) {
    let navigate = useNavigate();
    const { id } = useParams();

    const {
        data: fetchedRole,
        isLoading: fetchedRoleLoading,
        isSuccess: fetchedRoleSuccess,
        error: fetchedRoleError
    } = useGetRoleByIdQuery(id)

    const {
        data: fetchedVolunteers,
        isLoading: fetchedVolunteersLoading,
        isSuccess: fetchedVolunteersSuccess,
        error: fetchedVolunteersError
    } = useGetVolunteersQuery()

    const [
        updateRole,
        { 
            isLoading: isUpdating,
            isSuccess: updateSuccess
        },
    ] = useUpdateRoleMutation()

    const [
        deleteRole,
        { 
            isLoading: isDeleting,
            isSuccess: deleteSuccess
        }
    ] = useDeleteRoleMutation()

    let [role, setRole] = useState({})
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (fetchedRoleSuccess) {
            setRole(fetchedRole)
        }
    }, [fetchedRoleSuccess])

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
        updateRole(role)
    }

    useEffect(() => {
        if (updateSuccess) {
            navigate('/dashboard/roles')
        }
    }, [updateSuccess])

    const handleDelete = async (e) => {
        const seeIfRoleIsUsedByVolunteer = () => {
            let volunteersUsingRole = fetchedVolunteers.filter(volunteer => {
                let roleIds = []
                volunteer.roles.map(volunteerRole => {
                    if (volunteerRole.roleId === id) {
                        roleIds.push(id)
                    }
                })
                return roleIds.includes(id)
            })

            if (volunteersUsingRole.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        if (!seeIfRoleIsUsedByVolunteer()) {
            deleteRole(id)
        } else {
            setOpen(true);
        }
    }

    useEffect(() => {
        if (deleteSuccess) {
            navigate('/dashboard/roles')
        }
    }, [deleteSuccess])


    if (fetchedRoleLoading || fetchedVolunteersLoading) return (<LoadingTableSkeleton />)

    if (fetchedRoleSuccess && fetchedVolunteersSuccess) {
        return (
            <Grid container justifyContent={'center'} >
                <AlertDialog
                    open={open}
                    setOpen={() => setOpen(!open)}
                    title="Unable to Delete Role"
                    message="Looks like this role is being used by one or more volunteers. Please remove this award from the volunteers before deleting it."
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
                                            size='small'
                                            fullWidth
                                            value={role.name}
                                            onChange={(e) => handleNameChange(e)}
                                        />
                                    </Grid>
                                    <Grid item xs={10} textAlign={'center'}>
                                        <Button variant="outlined" type="submit">
                                            Update Role
                                        </Button>
                                    </Grid>
                                    <Grid item xs={10} textAlign={'center'}>
                                        <Button variant="outlined" onClick={handleDelete}>
                                            Delete Role
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