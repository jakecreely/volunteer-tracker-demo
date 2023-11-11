import { Card, Grid, Skeleton } from '@mui/material'
import React from 'react'

export function ProfileSkeleton() {
    return (
        <Card>
            <Grid container spacing={2} p={2}>
                <Grid item md={6} sm={12}>
                    <Skeleton variant="rounded" height={30} />
                </Grid>

                <Grid item md={6} sm={12}>
                    <Skeleton variant="rounded" height={30} />
                </Grid>

                <Grid item md={6} sm={12}>
                    <Skeleton variant="rounded" height={30} />
                </Grid>

                <Grid item md={6} sm={12}>
                    <Skeleton variant="rounded" height={30} />
                </Grid>
            </Grid>
            <Grid container spacing={2} p={2}>
                <Grid item xs={12}>
                    <Skeleton variant="rounded" height={50} />
                </Grid>

                <Grid item xs={12} sx={{ marginTop: 3 }}>
                    <Skeleton variant="rounded" height={100} />
                </Grid>

                <Grid item xs={12} sx={{ marginTop: 3 }}>
                    <Skeleton variant="rounded" height={30} />
                </Grid>

                <Grid item xs={12} sx={{ marginTop: 3 }}>
                    <Skeleton variant="rounded" height={30} />
                </Grid>
            </Grid>
        </Card>
    )
}