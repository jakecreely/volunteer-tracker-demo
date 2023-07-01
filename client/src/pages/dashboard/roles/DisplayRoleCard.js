import { Box, Button, Grid, Typography } from '@mui/material'
import React from 'react'
import { useGetRolesQuery } from '../../../features/api/apiSlice'
import { RoleTable } from '../../../components/tables/RoleTable'
import { LoadingTableSkeleton } from '../LoadingTableSkeleton'
import { useNavigate } from 'react-router-dom'

export function DisplayRoleCard() {
    const navigate = useNavigate()

    const {
        data: fetchedRoles,
        isLoading: fetchedRolesLoading,
        isSuccess: fetchedRolesSuccess,
        error: fetchedRolesError
    } = useGetRolesQuery()

    if (fetchedRolesLoading) return (<LoadingTableSkeleton />)
    if (fetchedRolesError) return (<div>Error! Could not fetch roles.</div>)

    if (fetchedRolesSuccess && fetchedRoles.length > 0) {
        return (
            <Grid container justifyContent={'center'}>
                <Grid item xs={12} md={4}>
                    <RoleTable roles={fetchedRoles}/>
                </Grid>
            </Grid>
        )
    } else {
        return (
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
        )
    }
}