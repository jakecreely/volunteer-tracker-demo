import * as React from 'react';
import Box from '@mui/material/Box';
import Title from '../../../components/Title';
import { TableContainer, Paper, Grid, Collapse } from '@mui/material'
import { UpcomingTrainingTable } from './UpcomingTrainingTable';
import orderBy from 'lodash/orderBy'
import { FilterSelect } from '../../../components/filter/FilterSelect';
import { ResetButton } from '../../../components/filter/ResetButton';
import { ExpandButton } from '../../../components/navigation/ExpandButton';
import { useGetTrainingQuery, useGetUpcomingTrainingQuery } from '../../../features/api/apiSlice';
import { UpcomingEmpty } from '../../../components/Empty';
import { LoadingTableSkeleton } from '../LoadingTableSkeleton';

export default function TrainingCard(props) {

    const [sorting, setSorting] = React.useState({ columnToSort: '', sortDirection: 'asc' })
    const [defaultDirection, setDefaultDirection] = React.useState('asc')
    const [selectedTraining, setSelectedTraining] = React.useState([])
    const [filteredTraining, setFilteredTraining] = React.useState([])
    const [formattedTraining, setFormattedTraining] = React.useState([])
    const [expanded, setExpanded] = React.useState(true);

    // Get the upcoming training data, refetch when the filterTime prop changes
    const {
        data: upcomingTraining,
        isLoading: upcomingTrainingLoading,
        isSuccess: upcomingTrainingSuccess,
        error: upcomingTrainingError
    } = useGetUpcomingTrainingQuery(props.filterTime)

    // Get the training data
    const {
        data: fetchedTraining,
        isLoading: fetchedTrainingLoading,
        isSuccess: fetchedTrainingSuccess,
        error: fetchedTrainingError
    } = useGetTrainingQuery()

    // Handles the switching between 'asc' and 'desc'
    const handleSortChange = (column) => {
        // If the column is already in the array, reverse it's direction
        if (sorting.columnToSort === column) {
            let sortDirection = sorting.sortDirection === 'asc' ? 'desc' : 'asc'
            setSorting({ columnToSort: column, sortDirection })
        } else {
            // If the column clicked is not the same as the chosen one
            setSorting({ columnToSort: column, sortDirection: defaultDirection })
        }
    }

    // When the upcoming training data is successfully fetched, format it for the table
    // Each row of the table needs to have a volunteer and a training (missing or outstanding)
    React.useEffect(() => {
        // Once the data is fetched, format it for the table
        if (upcomingTrainingSuccess) {
            let formattedUpcomingTraining = []
            upcomingTraining.forEach(volunteerWithTraining => {
                if (!volunteerWithTraining.volunteer.isArchived) {
                    volunteerWithTraining.missingTraining.forEach(missingTraining => {
                        formattedUpcomingTraining.push({
                            volunteer: volunteerWithTraining.volunteer,
                            training: missingTraining
                        })
                    })
                    volunteerWithTraining.overdueTraining.forEach(overdueTraining => {
                        formattedUpcomingTraining.push({
                            volunteer: volunteerWithTraining.volunteer,
                            training: overdueTraining
                        })
                    })
                }
                return formattedUpcomingTraining
            })
            setFilteredTraining(formattedUpcomingTraining)
            // The base data that is not, used for resetting the table
            setFormattedTraining(formattedUpcomingTraining)
        }
    }, [upcomingTraining])

    React.useEffect(() => {
        //Filter the upcoming training based on selected values
        const filterBasedOnSelectedTraining = async (upcomingTraining) => {
            let filteredData = []
            upcomingTraining.forEach(volunteerWithTraining => {
                if (selectedTraining.includes(volunteerWithTraining.training.name)) {
                    filteredData.push(volunteerWithTraining);
                }
            });
            return filteredData
        }

        // Order the upcoming training based on the selected column and direction
        const orderData = async (upcomingTraining) => {
            let orderedData = orderBy(upcomingTraining, sorting.columnToSort, sorting.sortDirection)
            return orderedData
        }

        // Wrapper for async functionality
        const filterData = async () => {
            if (upcomingTrainingSuccess && formattedTraining.length > 0) {
                // If has trainining has been selected
                if (selectedTraining.length > 0) {
                    let filteredBasedOnSelectedTraining = await filterBasedOnSelectedTraining(formattedTraining)
                    if (sorting.columnToSort !== '') {
                        let orderedData = await orderData(filteredBasedOnSelectedTraining)
                        setFilteredTraining(orderedData)
                    } else {
                        setFilteredTraining(filteredBasedOnSelectedTraining)
                    }
                } else {
                    if (sorting.columnToSort !== '') {
                        let orderedData = await orderData(formattedTraining)
                        setFilteredTraining(orderedData)
                    } else {
                        setFilteredTraining(formattedTraining)
                    }
                }
            }
        }
        filterData()
    }, [sorting, selectedTraining])

    const handleSelectedTrainingChange = (e) => {
        setSelectedTraining(e.target.value)
    }

    const handleReset = () => {
        setSelectedTraining([])
        setSorting({ columnToSort: '', sortDirection: '' })
    }

    return (
        <React.Fragment>
            <Box p={2}>
                <Grid container paddingBottom={1} justifyContent="space-between">
                    <Grid item>
                        <Title>{props.title}</Title>
                    </Grid>
                    <Grid item>
                        <ExpandButton expanded={expanded} setExpanded={setExpanded} />
                    </Grid>
                </Grid>
                <Collapse in={expanded} unmountOnExit>
                    <Grid container spacing={2} paddingBottom={2}>
                        <Grid item>
                            {fetchedTrainingLoading ?
                                <FilterSelect
                                    options={[]}
                                    selected={[]}
                                    emptyLabel="All Training"
                                    disabled
                                />
                                :
                                <FilterSelect
                                    options={fetchedTraining}
                                    selected={selectedTraining}
                                    emptyLabel="All Training"
                                    handleSelectedChange={(e) => handleSelectedTrainingChange(e)}
                                />
                            }
                        </Grid>
                        <Grid item>
                            <ResetButton handleReset={() => handleReset()} />
                        </Grid>
                    </Grid>
                    {upcomingTrainingSuccess ?
                        (filteredTraining && filteredTraining.length > 0 ?
                        <TableContainer component={Paper}>
                            <UpcomingTrainingTable
                                sorting={sorting}
                                handleSortChange={handleSortChange}
                                filteredData={filteredTraining}
                                loading={upcomingTrainingLoading}
                            />
                        </TableContainer>
                        : <UpcomingEmpty message="No training upcoming in the given timeframe" />
                        )
                        : upcomingTrainingError ?
                        "No Training Added. Please add training in the Training page." :
                        <LoadingTableSkeleton />
                    }
                </Collapse>
            </Box>
        </React.Fragment>
    );
}