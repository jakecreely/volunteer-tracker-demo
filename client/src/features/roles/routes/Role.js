import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Card, FormControl, Grid, TextField } from '@mui/material';
import { AlertDialog } from '../../../components/AlertDialog';
import { useDeleteRoleMutation, useGetRoleByIdQuery, useGetRolesWithVolunteerUsageQuery, useUpdateRoleMutation } from '../../../lib/apiSlice';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { RoleContainer } from '../components/RoleContainer';
import { useUpdateFeedbackDisplay } from '../../../hooks/useUpdateFeedbackDisplay';
import { useDeleteFeedbackDisplay } from '../../../hooks/useDeleteFeedbackDisplay';
import { BasicError } from '../../../components/BasicError';

export const Role = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isRoleDeleted, setIsRoleDeleted] = useState(false)
    const [role, setRole] = useState({})
    const [open, setOpen] = useState(false);

    const [
        updateRole,
        {
            isLoading: isUpdatingRole,
            isSuccess: updateRoleSuccess,
            isError: updateRoleFailed,
            error: updateRoleErrorData
        },
    ] = useUpdateRoleMutation()

    const [
        deleteRole,
        {
            isLoading: isDeletingRole,
            isSuccess: deleteRoleSuccess,
            isError: deleteRoleFailed,
            error: deleteRoleErrorData
        }
    ] = useDeleteRoleMutation()

    const {
        data: fetchedRole,
        isLoading: isFetchingRole,
        isSuccess: fetchedRoleSuccess,
        isError: fetchedRoleFailed,
        error: fetchedRoleErrorData
    } = useGetRoleByIdQuery(id, {
        skip: deleteRoleSuccess || isRoleDeleted
    })

    const {
        data: fetchedRolesWithVolunteerUsage,
        isLoading: isFetchingRolesWithVolunteerUsage,
        isSuccess: fetchedRolesWithVolunteerUsageSuccess,
        isError: fetchedRolesWithVolunteerUsageFailed,
        error: fetchedRolesWithVolunteerUsageErrorData
    } = useGetRolesWithVolunteerUsageQuery(id, {
        skip: deleteRoleSuccess || isRoleDeleted
    })

    const updateFeedbackDisplay = useUpdateFeedbackDisplay('Role', isUpdatingRole, updateRoleSuccess, updateRoleFailed, updateRoleErrorData)
    const deleteFeedbackDisplay = useDeleteFeedbackDisplay('Role', isDeletingRole, deleteRoleSuccess, deleteRoleFailed, deleteRoleErrorData)

    useEffect(() => {
        if (fetchedRoleSuccess) {
            setRole(fetchedRole)
        }
    }, [fetchedRoleSuccess])

    useEffect(() => {
        if (updateRoleSuccess) {
            navigate('/dashboard/roles?updated=true')
        }
    }, [updateRoleSuccess])

    useEffect(() => {
        if (deleteRoleSuccess) {
            navigate('/dashboard/roles?deleted=true')
        }
    }, [deleteRoleSuccess])

    const handleNameChange = (e) => {
        setRole(prev => ({ ...prev, name: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        updateRole(role)
    }

    const handleDelete = async (e) => {
        if (fetchedRolesWithVolunteerUsageSuccess) {
            if (fetchedRolesWithVolunteerUsage.isVolunteerUsingRole) {
                setOpen(true);
                return
            } else {
                deleteRole(id)
                setIsRoleDeleted(true)
            }
        }
    }

    if (isFetchingRole || isFetchingRolesWithVolunteerUsage) return (<LoadingTableSkeleton />)
    if (fetchedRoleFailed) return (<BasicError error={fetchedRoleErrorData.data} />)
    if (fetchedRolesWithVolunteerUsageFailed) return (<BasicError error={fetchedRolesWithVolunteerUsageErrorData.data} />)

    if (fetchedRoleSuccess && fetchedRolesWithVolunteerUsageSuccess) {
        return (
            <RoleContainer>
                <AlertDialog
                    open={open}
                    setOpen={() => setOpen(!open)}
                    title="Unable to Delete Role"
                    message="Looks like this role is being used by one or more volunteers. Please remove this award from the volunteers before deleting it."
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
                {updateFeedbackDisplay}
                {deleteFeedbackDisplay}
            </RoleContainer>
        )
    }
}