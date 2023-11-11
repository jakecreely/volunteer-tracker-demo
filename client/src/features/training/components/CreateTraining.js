import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useAddTrainingMutation, useGetRolesQuery } from '../../../lib/apiSlice';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';
import { useCreateFeedbackDisplay } from '../../../hooks/useCreateFeedbackDisplay';
import { formatExcludedRoles } from '../utils/format';
import { BasicError } from '../../../components/BasicError';
import { TrainingContainer } from './TrainingContainer';

export function CreateTraining() {
    const navigate = useNavigate();

    const {
        data: fetchedRoles,
        isLoading: fetchingRoles,
        isSuccess: fetchedRolesSuccess,
        isError: fetchedRolesFailed,
        error: fetchedRolesError
    } = useGetRolesQuery()

    const [
        addTraining,
        {
            isLoading: isAddingTraining,
            isSuccess: addTrainingSuccess,
            isError: addTrainingFailed,
            error: addTrainingErrorData
        }
    ] = useAddTrainingMutation()

    const [training, setTraining] = useState({
        name: "",
        renewalFrequency: null,
        excludedRoles: []
    })

    const [selectedExcludedRoles, setSelectedExcludedRoles] = useState([])

    const feedbackDisplay = useCreateFeedbackDisplay('Training', isAddingTraining, addTrainingSuccess, addTrainingFailed, addTrainingErrorData)

    useEffect(() => {
        if (addTrainingSuccess) {
            navigate('/dashboard/training?created=true')
        }
    }, [addTrainingSuccess])

    const handleNameChange = (e) => {
        setTraining(prev => {
            return {
                ...prev,
                name: e.target.value
            }
        })
    }

    const handleRenewalFrequencyChange = (e) => {
        setTraining(prev => {
            return {
                ...prev,
                renewalFrequency: e.target.value
            }
        })
    }

    const handleExcludedRolesChange = (e) => {
        setSelectedExcludedRoles(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        let trainingToSubmit = JSON.parse(JSON.stringify(training))
        const formattedTrainingToSubmit = await formatExcludedRoles(fetchedRoles, trainingToSubmit, selectedExcludedRoles)
        addTraining(formattedTrainingToSubmit)
    }

    if (fetchingRoles) return (<LoadingTableSkeleton />)
    if (fetchedRolesFailed) return (<BasicError error={fetchedRolesError.data} />)

    return (
        <TrainingContainer>
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
                                    size="small"
                                    required
                                    fullWidth
                                    value={training.name}
                                    onChange={(e) => handleNameChange(e)}
                                />
                            </Grid>
                            <Grid item xs={10}>
                                <TextField
                                    id="length"
                                    name="length"
                                    label="Length (Years)"
                                    type="number"
                                    size="small"
                                    required
                                    fullWidth
                                    value={training.length}
                                    onChange={(e) => handleRenewalFrequencyChange(e)}
                                />
                            </Grid>
                            <Grid item xs={10}>
                                <FormControl fullWidth>
                                    <InputLabel id="excludedRoles" size="small">Roles Excluded From Training</InputLabel>
                                    <Select
                                        multiple
                                        id="excludedRole-select"
                                        labelId='excludedRoles'
                                        value={selectedExcludedRoles}
                                        onChange={(e) => handleExcludedRolesChange(e)}
                                        size="small"
                                        fullWidth
                                        label="Roles Excluded From Training"
                                        renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value, index) => {
                                                if (index === selected.length - 1) {
                                                    return (
                                                        <div key={value}>{value}</div>
                                                    )
                                                } else {
                                                    return (
                                                        <div key={value}>{value + ", "}</div>
                                                    )
                                                }
                                            })}
                                        </Box>}
                                    >
                                        {fetchedRolesSuccess && fetchedRoles.map((role) => {
                                            return (
                                                <MenuItem value={role.name}>
                                                    {role.name}
                                                </MenuItem>
                                            )
                                        })}
                                    </Select>
                                </FormControl>
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
        </TrainingContainer>
    )
}