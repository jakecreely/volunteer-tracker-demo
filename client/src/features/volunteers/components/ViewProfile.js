import { Select, MenuItem, TextField, Grid, InputLabel, FormControl, InputAdornment } from '@mui/material'
import { Box } from '@mui/system';
import React from 'react';
import { AwardCard } from './AwardCard';
import { TrainingCard } from './TrainingCard';
import { DocumentCard } from './DocumentCard';
import { formatDate } from '../../../utils/dateUtils';

export function ViewProfile(props) {
    if (props.volunteer && props.fetchedAwards && props.fetchedDocuments && props.upcomingAwards) {
        return (
            <Grid container spacing={2}>
                <Grid item md={6} sm={12}>
                    <TextField
                        fullWidth
                        type="text"
                        id="name"
                        value={props.volunteer.name}
                        label={"Name"}
                        size="small"
                        InputProps={{
                            readOnly: true
                        }}
                        disabled={props.volunteer.isArchived}
                    />
                </Grid>

                <Grid item md={6} sm={12}>
                    <TextField
                        fullWidth
                        type="number"
                        id="breakDuration"
                        value={props.volunteer.breakDuration}
                        label={"Break Duration"}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">Days</InputAdornment>,
                            readOnly: true
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
                        value={formatDate(props.volunteer.birthday)}
                        label={"Birthday"}
                        InputProps={{
                            readOnly: true
                        }}
                        size="small"
                        disabled={props.volunteer.isArchived}
                    />
                </Grid>

                <Grid item md={6} sm={12}>
                    <TextField
                        fullWidth
                        type="date"
                        id="startDate"
                        value={formatDate(props.volunteer.startDate)}
                        label={"Start Date"}
                        InputProps={{
                            readOnly: true
                        }}
                        size="small"
                        disabled={props.volunteer.isArchived}
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="role-select-helper-text">Roles</InputLabel>
                        <Select
                            multiple
                            id="role-select"
                            value={props.volunteer.roles.map(elem => elem.name)}
                            label="Role"
                            size="small"
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return <em key={0}>{"No Role"}</em>;
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
                            inputProps={{
                                readOnly: true
                            }}
                            disabled={props.volunteer.isArchived}
                        >
                            {props.fetchedRoles.map((role) => {
                                return (
                                    <MenuItem value={role.name} key={role.name}>
                                        {role.name}
                                    </MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid
                    item
                    margin="auto"
                >
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
                                        edit={false}
                                    />
                                </Grid>

                            )
                        }
                        )}
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="award-select-helper-text" size="small">Awards</InputLabel>
                        <Select
                            multiple
                            value={props.volunteer.awards.map(elem => elem.name)}
                            size='small'
                            id="award-select"
                            label="Awards"
                            fullWidth
                            disabled={props.volunteer.isArchived}
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return <em key={0}>{"No Awards"}</em>;
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
                            inputProps={{
                                readOnly: true
                            }}
                        >
                            {props.fetchedAwards.map(award => {
                                return <MenuItem key={award.name} value={award.name}>{award.name}</MenuItem>
                            })}
                        </Select>
                    </FormControl>

                    <Grid container spacing={3} sx={{ marginTop: -1 }}>
                        {props.volunteer.awards.map(awardElem => {
                            return (
                                <Grid item xs={12} sm={6} md={4} lg={4} key={awardElem.awardId}>
                                    <AwardCard
                                        award={awardElem}
                                        isArchived={props.volunteer.isArchived}
                                        edit={false}
                                    />
                                </Grid>
                            )
                        })}
                        {props.upcomingAwards.map(awardElem => {
                            return (
                                <Grid item xs={12} sm={6} md={4} lg={4} key={awardElem.awardId}>
                                    <AwardCard
                                        isUpcoming={true}
                                        award={awardElem}
                                        isArchived={props.volunteer.isArchived}
                                        edit={false}
                                        handleAddingUpcomingAward={props.handleAddingUpcomingAward}
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
                            value={props.volunteer.training.map(elem => elem.name)}
                            id="training-select"
                            label="Training"
                            size='small'
                            fullWidth
                            disabled={props.volunteer.isArchived}
                            displayEmpty
                            renderValue={(selected) => {
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
                            }}
                            inputProps={{
                                readOnly: true
                            }}
                        >
                            {props.fetchedTraining.map((training) => {
                                return <MenuItem value={training.name} key={training._id}>{training.name}</MenuItem>
                            })}
                        </Select>
                    </FormControl>

                    <Grid container spacing={1} sx={{ marginTop: 0.5 }}>
                        {props.volunteer.training.map((trainingElem) => {
                            const overdueTraining = props.overdueTraining.find(elem => {
                                return elem.trainingId === trainingElem.trainingId
                            })
                            return (
                                <Grid item xs={6} key={trainingElem.trainingId}>
                                    <TrainingCard
                                        training={trainingElem}
                                        isArchived={props.volunteer.isArchived}
                                        edit={false}
                                        overdueTraining={overdueTraining}
                                    />
                                </Grid>
                            )
                        })}
                        {props.missingTraining.map((trainingElem) => {
                            return (
                                <Grid item xs={6} key={trainingElem.trainingId}>
                                    <TrainingCard
                                        training={trainingElem}
                                        isArchived={props.volunteer.isArchived}
                                        edit={false}
                                        isMissing={true}
                                        handleAddingMissingTraining={props.handleAddingMissingTraining}
                                    />
                                </Grid>
                            )
                        })}
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}