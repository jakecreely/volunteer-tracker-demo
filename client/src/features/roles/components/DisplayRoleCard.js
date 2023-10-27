import { Box, Button, Grid, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useGetRolesQuery } from '../../../lib/apiSlice'
import { RoleTable } from './RoleTable'
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusSnackbar } from '../../../components/StatusSnackbar'

export function DisplayRoleCard() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams();
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)
    const {
        data: fetchedRoles,
        isLoading: fetchedRolesLoading,
        isSuccess: fetchedRolesSuccess,
        error: fetchedRolesError
    } = useGetRolesQuery()

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Role Created Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('updated') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Role Updated Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('deleted') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Role Deleted Successfully"}
                    statusType={'success'}
                />
            )
        } else {
            setFeedbackDisplay(null)
        }
    }, [searchParams])

    if (fetchedRolesLoading) return (<LoadingTableSkeleton />)
    if (fetchedRolesError) return (<div>Error fetching roles. Please try again later.</div>)

    if (fetchedRolesSuccess && fetchedRoles.length > 0) {
        return (
            <Box>
                <Grid container justifyContent={'center'}>
                    <Grid item xs={12} md={4}>
                        <RoleTable roles={fetchedRoles} />
                    </Grid>
                </Grid>
                {feedbackDisplay}
            </Box>
        )
    } else {
        return (
            <Box>
                <Grid container justifyContent={'center'}>
                    <Grid item xs={12} md={10} lg={8}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant='body'>No Roles. Why not add one!</Typography>
                            <br /> <br />
                            <Button variant="outlined" onClick={() => navigate("/dashboard/roles/create")}>
                                Create Role
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        )
    }
}