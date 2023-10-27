import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Box, Button, Card, FormControl, Grid, TextField } from '@mui/material';
import { useNavigate } from "react-router-dom";
import AlertDialog from '../../../components/AlertDialog';
import { useDeleteRoleMutation, useGetRoleByIdQuery, useGetVolunteersQuery, useUpdateRoleMutation } from '../../../lib/apiSlice';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { StatusSnackbar } from '../../../components/StatusSnackbar';

export function UpdateRoleForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isRoleDeleted, setIsRoleDeleted] = useState(false)
    const [role, setRole] = useState({})
    const [open, setOpen] = useState(false);
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    const [
        updateRole,
        { 
            isLoading: isUpdating,
            isSuccess: updateSuccess,
            isError: updateError,
            error: updateErrorData
        },
    ] = useUpdateRoleMutation()

    const [
        deleteRole,
        { 
            isLoading: isDeleting,
            isSuccess: deleteSuccess,
            isError: deleteError,
            error: deleteErrorData
        }
    ] = useDeleteRoleMutation()

    const {
        data: fetchedRole,
        isLoading: fetchedRoleLoading,
        isSuccess: fetchedRoleSuccess,
        error: fetchedRoleError
    } = useGetRoleByIdQuery(id, {
        skip: deleteSuccess || isRoleDeleted
    })

    const {
        data: fetchedVolunteers,
        isLoading: fetchedVolunteersLoading,
        isSuccess: fetchedVolunteersSuccess,
        error: fetchedVolunteersError
    } = useGetVolunteersQuery()

    useEffect(() => {
        if (fetchedRoleSuccess) {
            setRole(fetchedRole)
        }
    }, [fetchedRoleSuccess])

    useEffect(() => {
        if (isUpdating) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Updating Role... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isUpdating])

    useEffect(() => {
        if (updateError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Updating Role Failed!"}
                    errorMessage={updateErrorData.data}
                    statusType={"error"}
                />
            )
        }
    }, [updateError])

    useEffect(() => {
        if (isDeleting) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Deleting Role... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isDeleting])

    useEffect(() => {
        if (deleteError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Deleting Role Failed!"}
                    errorMessage={deleteErrorData.data}
                    statusType={"error"}
                />
            )
        }
    }, [deleteError])

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
            navigate('/dashboard/roles?updated=true')
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
            setIsRoleDeleted(true)
        } else {
            setOpen(true);
        }
    }

    useEffect(() => {
        if (deleteSuccess) {
            navigate('/dashboard/roles?deleted=true')
        }
    }, [deleteSuccess])


    if (fetchedRoleLoading || fetchedVolunteersLoading) return (<LoadingTableSkeleton />)

    if (fetchedRoleSuccess && fetchedVolunteersSuccess) {
        return (
            <Box>
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
            </Grid>
            {feedbackDisplay}
            </Box>
        )
    }
}