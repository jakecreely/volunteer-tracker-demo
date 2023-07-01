import { Select, MenuItem, FormControlLabel, Checkbox, TextField, FormLabel, FormGroup, Grid, InputLabel, FormControl, Card, Typography, CardContent, Button } from '@mui/material'
import { Box } from '@mui/system';
import React from 'react';
import { DocumentCard } from '../profile/containers/DocumentCard';
import { useAutoFillAwardsMutation } from '../../features/api/apiSlice';

export function CreateDetailCard(props) {

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
            <Grid container marginTop={2}>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={<Checkbox
                            checked={props.volunteer.isArchived}
                            onChange={(e) => props.handleCheckboxChange(e)}
                            name="isArchived"
                            id="isArchived"
                        />}
                        label="Archived"
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


                <Grid item sx={{ paddingInline: 3 }}>
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        sx={{ paddingTop: 2 }}
                        alignItems="center"
                        justify="center"
                    >
                        {props.fetchedDocuments.map(document => {
                            let foundDocument = props.volunteer.documents.find(elem => {
                                return elem.name === document.name
                            })
                            return (
                                <DocumentCard
                                    foundDocument={foundDocument}
                                    document={document}
                                    isArchived={props.volunteer.isArchived}
                                    edit={true}
                                    handleChange={props.handleDocumentChange}
                                />
                            )
                        }
                        )}
                    </Grid>
                </Grid>

                <Grid item xs={12} sx={{ marginTop: 3 }}>
                    <Grid container columnGap={2}>
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
                                disabled={isUpdating}
                            >
                                Auto-Fill
                            </Button>
                        </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ marginTop: 0.5 }}>
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

                            return (<Grid item xs={6}>
                                <Grid fullWidth xs={12}>
                                    <Card variant="outlined" >
                                        <CardContent>

                                            <Grid item xs={12}>
                                                <Grid container>
                                                    <Grid item md={8} xs={6}>
                                                        <Typography gutterBottom variant="h6" component="div">{awardElem.name}</Typography>

                                                    </Grid>
                                                    <Grid item md={4} xs={6}>
                                                        <FormControlLabel
                                                            control={<Checkbox
                                                                checked={awardElem.isGiven}
                                                                onChange={(e) => props.handleAwardChange(e)
                                                                }
                                                                name="isGiven"
                                                                id={awardElem.name}
                                                            />}
                                                            label="Given"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12} lg={6}>
                                                <TextField
                                                    type="date"
                                                    helperText="Date Achieved"
                                                    name="achievedDate"
                                                    required
                                                    id={awardElem.name}
                                                    value={moment(awardElem.achievedDate).format('YYYY-MM-DD')}
                                                    onChange={(e) => props.handleAwardChange(e)}
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={12} lg={6}>
                                                {dateGivenField}
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>)
                        })}
                    </Grid>
                </Grid>

                <Grid item xs={12} sx={{ marginTop: 3 }}>
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
                                <Card variant="outlined">
                                    <CardContent>
                                        <Grid >
                                            <Grid item>
                                                {trainingElem.name}
                                            </Grid>
                                            <Grid item>
                                                <TextField
                                                    type="date"
                                                    name="completedOn"
                                                    required
                                                    id={trainingElem.name}
                                                    value={moment(trainingElem.completedOn).format('YYYY-MM-DD')}
                                                    onChange={(e) => props.handleTrainingChange(e)}
                                                    size="small"
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>)
                        })}
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}