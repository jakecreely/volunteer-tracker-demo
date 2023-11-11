import { Button, Card, FormControl, Grid, TextField } from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useState } from 'react'
import { useAddRoleMutation } from '../../../lib/apiSlice';
import { useNavigate } from 'react-router-dom';
import { RoleContainer } from './RoleContainer';
import { useCreateFeedbackDisplay } from '../../../hooks/useCreateFeedbackDisplay';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { BasicError } from '../../../components/BasicError';

export function CreateRole(props) {
    const navigate = useNavigate()
    const [role, setRole] = useState({name: ""})

    const [
        createRole,
        {
            isLoading: isCreatingRole,
            isSuccess: createRoleSuccess,
            isError: createRoleFailed,
            error: deleteRoleErrorData
        }
    ] = useAddRoleMutation()

    useEffect(() => {
        if (props.passedRole) {
            setRole(props.passedRole)
        }
    }, [props.passedRole])

    useEffect(() => {
        console.log(props.passedRole)
        if (createRoleSuccess) {
            if (props.passedRole && props.handleSuccess) {
                props.handleSuccess()
            } else {
                navigate('/dashboard/roles?created=true')
            }
        }
    }, [createRoleSuccess])

    const handleNameChange = (e) => {
        setRole(prev => ({...prev, name: e.target.value}))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        createRole(role)
    }
    
    const feedbackDisplay = useCreateFeedbackDisplay('Role', isCreatingRole, createRoleSuccess, createRoleFailed, deleteRoleErrorData)

    return (
        <RoleContainer>
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
                                    size="small"
                                    fullWidth
                                    value={role.name}
                                    onChange={handleNameChange}
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
        </RoleContainer>
    )
}