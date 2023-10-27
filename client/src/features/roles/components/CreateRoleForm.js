import { Button, Card, FormControl, Grid, TextField } from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useState } from 'react'
import { useAddRoleMutation } from '../../../lib/apiSlice';
import { StatusSnackbar } from '../../../components/StatusSnackbar';

export function CreateRoleForm(props) {
    const [role, setRole] = useState({
        name: "",
    })

    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    const [
        createRole,
        {
            isLoading: isCreating,
            isError: createError,
            isSuccess: createSuccess,
            error: createErrorData
        }
    ] = useAddRoleMutation()

    useEffect(() => {
        if (props.role) {
            setRole(props.role)
        }
    }, [props.role])

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
            props.handleSuccess()
        }
    }, [createSuccess])

    useEffect(() => {
        if (isCreating) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Creating Role... Do Not Refresh Page"}
                    anchorVertical={'bottom'}
                    anchorHorizontal={'right'}
                    statusType={"info"}
                />
            )
        }
    }, [isCreating])

    useEffect(() => {
        if (createError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Role Creation Failed!"}
                    errorMessage={createErrorData.data}
                    anchorVertical={'bottom'}
                    anchorHorizontal={'right'}
                    statusType={"error"}
                />
            )
        }
    }, [createError])

    return (
        <Box>
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
            {feedbackDisplay}
        </Box>
    )
}