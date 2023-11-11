import Box from '@mui/material/Box';
import { TableContainer, Paper, Grid, Collapse } from '@mui/material'
import { UpcomingTrainingTable } from './UpcomingTrainingTable';
import orderBy from 'lodash/orderBy'
import { FilterSelect } from '../../../components/FilterSelect';
import { ResetButton } from '../../../components/ResetButton';
import { useGetTrainingQuery, useGetUpcomingTrainingQuery } from '../../../lib/apiSlice';
import { UpcomingEmpty } from '../../../components/UpcomingEmpty';
import { useEffect, useState } from 'react';
import { BasicError } from '../../../components/BasicError';
import { UpcomingTitle } from '../../../components/UpcomingTitle';

export function UpcomingTrainingCard(props) {
    const [sorting, setSorting] = useState({ columnToSort: '', sortDirection: '' })
    const [selectedTraining, setSelectedTraining] = useState([])
    const [filteredTraining, setFilteredTraining] = useState([])
    const [formattedTraining, setFormattedTraining] = useState([])
    const [expanded, setExpanded] = useState(true);
    const defaultDirection = 'asc'
    const defaultColumn = 'training.completedOn'

    // Get the upcoming training data, refetch when the filterTime prop changes
    const {
        data: upcomingTraining,
        isLoading: fetchingUpcomingTraining,
        isSuccess: upcomingTrainingSuccess,
        isError: upcomingTrainingFailed,
        error: upcomingTrainingError
    } = useGetUpcomingTrainingQuery(props.filterTime)

    // Get the training data
    const {
        data: fetchedTraining,
        isLoading: fetchingTraining,
        isSuccess: fetchedTrainingSuccess,
        isError: fetchedTrainingFailed,
        error: fetchedTrainingError
    } = useGetTrainingQuery()

    // Handles the switching between 'asc' and 'desc'
    const handleSortChange = (column) => {
        // If the column is already in the array, reverse it's direction
        if (sorting.columnToSort === column) {
            const sortDirection = sorting.sortDirection === 'asc' ? 'desc' : 'asc'
            setSorting({ columnToSort: column, sortDirection })
        } else {
            // If the column clicked is not the same as the chosen one
            setSorting({ columnToSort: column, sortDirection: defaultDirection })
        }
    }

    // When the upcoming training data is successfully fetched, format it for the table
    // Each row of the table needs to have a volunteer and a training (missing or outstanding)
    useEffect(() => {
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

    useEffect(() => {
        // If fetched upcoming then set the default sorting
        if (upcomingTrainingSuccess) {
            setSorting({ columnToSort: defaultColumn, sortDirection: defaultDirection })
        }
    }, [upcomingTrainingSuccess])

    useEffect(() => {
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
            const orderedData = orderBy(upcomingTraining, sorting.columnToSort, sorting.sortDirection)
            return orderedData
        }

        // Wrapper for async functionality
        const filterData = async () => {
            if (upcomingTrainingSuccess && formattedTraining.length > 0) {
                // If has trainining has been selected
                if (selectedTraining.length > 0) {
                    const filteredBasedOnSelectedTraining = await filterBasedOnSelectedTraining(formattedTraining)
                    if (sorting.columnToSort !== '') {
                        const orderedData = await orderData(filteredBasedOnSelectedTraining)
                        setFilteredTraining(orderedData)
                    } else {
                        setFilteredTraining(filteredBasedOnSelectedTraining)
                    }
                } else {
                    if (sorting.columnToSort !== '') {
                        const orderedData = await orderData(formattedTraining)
                        setFilteredTraining(orderedData)
                    } else {
                        setFilteredTraining(formattedTraining)
                    }
                }
            }
        }
        filterData()
    }, [sorting, selectedTraining, formattedTraining])

    const handleSelectedTrainingChange = (e) => {
        setSelectedTraining(e.target.value)
    }

    const handleReset = () => {
        setSelectedTraining([])
    }

    if (upcomingTrainingFailed) return (<BasicError error={upcomingTrainingError} />)
    if (fetchedTrainingFailed) return (<BasicError error={fetchedTrainingError} />)

    return (
        <Box p={2}>
            <UpcomingTitle title="Upcoming Training" expanded={expanded} setExpanded={setExpanded} />
            <Collapse in={expanded} unmountOnExit>
                <FilterSelectionContainer
                    fetchedTrainingSuccess={fetchedTrainingSuccess}
                    fetchedTraining={fetchedTraining}
                    selectedTraining={selectedTraining}
                    handleSelectedTrainingChange={handleSelectedTrainingChange}
                    handleReset={handleReset}
                />
                <UpcomingTrainingDisplay 
                    filteredTraining={filteredTraining}
                    sorting={sorting}
                    handleSortChange={handleSortChange}
                    fetchingUpcomingTraining={fetchingUpcomingTraining}
                />
            </Collapse>
        </Box>
    );
}

function FilterSelectionContainer(props) {
    let filterSelect = null
    if (props.fetchedTrainingSuccess) {
        filterSelect = <FilterSelect
            options={props.fetchedTraining}
            selected={props.selectedTraining}
            emptyLabel="All Training"
            handleSelectedChange={(e) => props.handleSelectedTrainingChange(e)}
        />
    } else {
        filterSelect = <FilterSelect
            options={[]}
            selected={[]}
            emptyLabel="All Training"
            disabled
        />
    }

    return (
        <Grid container spacing={2} paddingBottom={2}>
            <Grid item>
                {filterSelect}
            </Grid>
            <Grid item>
                {<ResetButton handleReset={() => props.handleReset()} />}
            </Grid>
        </Grid>
    )
}

function UpcomingTrainingDisplay(props) {
    if (props.filteredTraining && props.filteredTraining.length > 0) {
        return (
            <TableContainer component={Paper}>
                <UpcomingTrainingTable
                    sorting={props.sorting}
                    handleSortChange={props.handleSortChange}
                    filteredData={props.filteredTraining}
                    loading={props.fetchingUpcomingTraining}
                />
            </TableContainer>
        )
    } else {
        return <UpcomingEmpty message="No training upcoming in the given timeframe" />
    }
}