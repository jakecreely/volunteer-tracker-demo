import { Select, MenuItem, FormControlLabel, Checkbox, TextField, FormLabel, FormGroup, Grid, InputLabel, FormControl, Card, Typography, CardContent, Button, InputAdornment } from '@mui/material'
import { Box } from '@mui/system';
import React from 'react';
import { useAutoFillAwardsMutation } from '../../../lib/apiSlice';
import { DocumentCard } from './DocumentCard';
import { TrainingCard } from './TrainingCard';
import { AwardCard } from './AwardCard';

export function CreateDetails(props) {

    const moment = require('moment');

    let filteredAwards = [];
    let filteredTraining = [];

    if (props.volunteer) {
        filteredAwards = props.volunteer.awards.filter(elem => {
            return props.selectedAwards.includes(elem.name)
        })

        filteredTraining = props.volunteer.training.filter(elem => {
            return props.selectedTraining.includes(elem.name)
        })
    }

    const [
        autoFillAwards, // This is the mutation trigger
        { isLoading: isUpdating }, // This is the destructured mutation result
    ] = useAutoFillAwardsMutation()

    const handleClick = () => {
        if (props.volunteer && props.volunteer.startDate) {
            let breakDuration = props.volunteer.breakDuration ? props.volunteer.breakDuration : 0
            const { startDate } = props.volunteer
            autoFillAwards({ startDate, breakDuration })
            .unwrap()
            .then(fulfilled => {
                props.handleAutoFillAwards(fulfilled)
            })
            .catch(rejected => console.error(rejected))
        }
    }

    if (props.volunteer && props.fetchedAwards && props.fetchedDocuments) {
        return (
            props.volunteer &&
            <Grid container spacing={2}>
                <Grid item md={6} sm={12}>
                    <TextField
                        fullWidth
                        required
                        type="text"
                        id="name"
                        value={props.volunteer.name}
                        label="Name"
                        onChange={props.handleChange}
                        size="small"
                        disabled={props.volunteer.isArchived}
                    />
                </Grid>

                <Grid item md={6} sm={12}>
                    <TextField
                        fullWidth
                        type="number"
                        id="breakDuration"
                        required
                        value={props.volunteer.breakDuration}
                        label={"Break Duration"}
                        onChange={props.handleChange}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">Days</InputAdornment>
                        }}
                        size="small"
                        disabled={props.volunteer.isArchived}
                    />
                </Grid>

                <Grid item md={6} sm={12}>
                    <TextField
                        fullWidth
                        type="date"
                        id="birthday"
                        required
                        value={moment(props.volunteer.birthday).format('YYYY-MM-DD')}
                        label={"Birthday"}
                        onChange={props.handleChange}
                        size="small"
                        disabled={props.volunteer.isArchived}
                    />
                </Grid>

                <Grid item md={6} sm={12}>
                    <TextField
                        fullWidth
                        type="date"
                        id="startDate"
                        required
                        value={moment(props.volunteer.startDate).format('YYYY-MM-DD')}
                        label={"Start Date"}
                        onChange={props.handleChange}
                        size="small"
                        disabled={props.volunteer.isArchived}
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="role-select-helper-text" size="small">Roles</InputLabel>
                        <Select
                            multiple
                            labelId="role-select-helper-text"
                            id="role-select"
                            required
                            value={props.volunteer.roles.map(elem => { return elem.name })}
                            onChange={props.handleSelectedRoles}
                            label="Roles"
                            size="small"
                            disabled={props.volunteer.isArchived}
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return <em key={0}>{"No Roles Selected"}</em>;
                                } else {
                                    return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value, index) => {
                                            if (index === selected.length - 1) {
                                                return (
                                                    <Box key={value}>{value}</Box>
                                                )
                                            } else {
                                                return (
                                                    <Box key={value}>{value + ", "}</Box>
                                                )
                                            }
                                        })}
                                    </Box>
                                }
                            }}
                        >
                            {props.fetchedRoles && props.fetchedRoles.map((elem) => {
                                return (
                                    <MenuItem value={elem.name}>
                                        {elem.name}
                                    </MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                </Grid>


                <Grid item
                    margin="auto">
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        justifyContent="center" // Center content horizontally
                        alignItems="center" // Center content vertically
                    >
                        {props.fetchedDocuments.map(document => {
                            let foundDocument = props.volunteer.documents.find(elem => {
                                return elem.name === document.name
                            })
                            return (
                                <Grid item xs={6} md={4} lg={3} key={document._id}>
                                    <DocumentCard
                                        foundDocument={foundDocument}
                                        document={document}
                                        isArchived={props.volunteer.isArchived}
                                        edit={true}
                                        handleChange={props.handleDocumentChange}
                                    />
                                </Grid>
                            )
                        }
                        )}
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <Grid container justifyContent="space-between">
                        <Grid item xs={12} md={9}>
                            <FormControl fullWidth>
                                <InputLabel id="award-select-helper-text" size="small">Award</InputLabel>
                                <Select
                                    multiple
                                    labelId='award-select-helper-text'
                                    value={filteredAwards.map(elem => { return elem.name })}
                                    onChange={props.handleSelectedAwardChange}
                                    size='small'
                                    fullWidth
                                    label="Award"
                                    disabled={props.volunteer.isArchived}
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return <em key={0}>{"No Awards Selected"}</em>;
                                        } else {
                                            return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value, index) => {
                                                    if (index === selected.length - 1) {
                                                        return (
                                                            <Box key={value}>{value}</Box>
                                                        )
                                                    } else {
                                                        return (
                                                            <Box key={value}>{value + ", "}</Box>
                                                        )
                                                    }
                                                })}
                                            </Box>
                                        }
                                    }}
                                >
                                    {props.fetchedAwards && props.fetchedAwards.map(elem => {
                                        return <MenuItem value={elem.name}>{elem.name}</MenuItem>
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                variant='contained'
                                onClick={() => handleClick()}
                                fullWidth
                                disabled={isUpdating || props.volunteer.isArchived}
                            >
                                Auto-Fill
                            </Button>
                        </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ marginTop: -1 }}>
                        {filteredAwards.map((awardElem, index) => {
                            let dateGivenField

                            if (!awardElem.isGiven) {
                                dateGivenField = <TextField
                                    disabled
                                    type="date"
                                    helperText="Date Given"
                                    name="givenDate"
                                    id={awardElem.name}
                                    value={moment(awardElem.givenDate).format('YYYY-MM-DD')}
                                    onChange={(e) => props.handleAwardChange(e)}
                                    size="small"
                                />
                            } else {
                                dateGivenField = <TextField
                                    type="date"
                                    helperText="Date Given"
                                    name="givenDate"
                                    required
                                    id={awardElem.name}
                                    value={moment(awardElem.givenDate).format('YYYY-MM-DD')}
                                    onChange={(e) => props.handleAwardChange(e)}
                                    size="small"
                                />
                            }

                            return (
                                <Grid item xs={12} sm={6} md={4} lg={4}>
                                    <AwardCard
                                        award={awardElem}
                                        isArchived={props.volunteer.isArchived}
                                        edit={true}
                                        handleAwardChange={props.handleAwardChange}
                                    />
                                </Grid>
                            )
                        })}
                    </Grid>
                </Grid>

                <Grid item xs={12} sx={{ marginTop: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel id="training-select-helper-text" size="small">Training</InputLabel>
                        <Select
                            multiple
                            labelId='training-select-helper-text'
                            value={filteredTraining.map(elem => { return elem.name })}
                            onChange={props.handleSelectedTrainingChange}
                            size='small'
                            label="Training"
                            fullWidth
                            disabled={props.volunteer.isArchived}
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return <em key={0}>{"No Training Selected"}</em>;
                                } else {
                                    return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value, index) => {
                                            if (index === selected.length - 1) {
                                                return (
                                                    <Box key={value}>{value}</Box>
                                                )
                                            } else {
                                                return (
                                                    <Box key={value}>{value + ", "}</Box>
                                                )
                                            }
                                        })}
                                    </Box>
                                }
                            }}
                        >
                            {props.fetchedTraining && props.fetchedTraining.map((elem) => {
                                return <MenuItem value={elem.name}>{elem.name}</MenuItem>
                            })}
                        </Select>
                    </FormControl>

                    <Grid container spacing={3} sx={{ marginTop: 0.5 }}>
                        {filteredTraining.map((trainingElem, index) => {
                            return (<Grid item xs={6}>
                                <TrainingCard
                                    training={trainingElem}
                                    isArchived={props.volunteer.isArchived}
                                    edit={true}
                                    handleTrainingChange={props.handleTrainingChange}
                                />
                            </Grid>)
                        })}
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}