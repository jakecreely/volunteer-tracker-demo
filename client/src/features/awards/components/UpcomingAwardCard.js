import Box from '@mui/material/Box';
import { TableContainer, Paper, Grid, Collapse } from '@mui/material'
import orderBy from 'lodash/orderBy'
import { UpcomingAwardsTable } from './UpcomingAwardsTable';
import { FilterSelect } from '../../../components/FilterSelect';
import { ResetButton } from '../../../components/ResetButton';
import { useGetAwardsQuery, useGetUpcomingAwardsQuery } from '../../../lib/apiSlice';
import { UpcomingEmpty } from '../../../components/UpcomingEmpty';
import { useEffect, useState } from 'react';
import { BasicError } from '../../../components/BasicError';
import { UpcomingTitle } from '../../../components/UpcomingTitle';

export function UpcomingAwardCard(props) {
    const [sorting, setSorting] = useState({ columnToSort: '', sortDirection: '' })
    const [selectedAwards, setSelectedAwards] = useState([])
    const [filteredAwards, setFilteredAwards] = useState([])
    const [formattedAwards, setFormattedAwards] = useState([])
    const [expanded, setExpanded] = useState(true);
    const defaultDirection = 'asc'
    const defaultColumn = 'award.achievedDate'

    // Get the upcoming award data, refetch when the filterTime prop changes
    const {
        data: upcomingAwards,
        isLoading: fetchingUpcomingAwards,
        isSuccess: upcomingAwardsSuccess,
        isError: upcomingAwardsFailed,
        error: upcomingAwardErrorData
    } = useGetUpcomingAwardsQuery(props.filterTime)

    // Get the training data
    const {
        data: fetchedAwards,
        isLoading: fetchingAwards,
        isSuccess: fetchedAwardSuccess,
        isError: fetchedAwardFailed,
        error: fetchedAwardErrorData
    } = useGetAwardsQuery()

    useEffect(() => {
        if (upcomingAwardsSuccess) {
            setSorting({ columnToSort: defaultColumn, sortDirection: defaultDirection })
        }
    }, [upcomingAwardsSuccess])

    useEffect(() => {
        // Once the data is fetched, format it for the table
        if (upcomingAwardsSuccess) {
            let formattedUpcomingAwards = []
            upcomingAwards.forEach(volunteerWithAwards => {
                if (!volunteerWithAwards.volunteer.isArchived) {
                    volunteerWithAwards.awardsNotGiven.forEach(missingAwards => {
                        formattedUpcomingAwards.push({
                            volunteer: volunteerWithAwards.volunteer,
                            award: missingAwards
                        })
                    })
                    volunteerWithAwards.upcomingAwards.forEach(upcomingAward => {
                        formattedUpcomingAwards.push({
                            volunteer: volunteerWithAwards.volunteer,
                            award: upcomingAward
                        })
                    })
                }
                return formattedUpcomingAwards
            })
            setFilteredAwards(formattedUpcomingAwards)
            // The base data that is not, used for resetting the table
            setFormattedAwards(formattedUpcomingAwards)
        }
    }, [upcomingAwards])

    useEffect(() => {
        //Filter the upcoming training based on selected values
        const filterBasedOnSelectedAwards = async (upcomingAwards) => {
            let filteredData = []
            upcomingAwards.forEach(volunteerWithAward => {
                if (selectedAwards.includes(volunteerWithAward.award.name)) {
                    filteredData.push(volunteerWithAward);
                }
            });
            return filteredData
        }

        // Order the upcoming training based on the selected column and direction
        const orderData = async (upcomingAwards) => {
            let orderedData = orderBy(upcomingAwards, sorting.columnToSort, sorting.sortDirection)
            return orderedData
        }

        // Wrapper for async functionality
        const filterData = async () => {
            if (upcomingAwardsSuccess && formattedAwards.length > 0) {
                // If has trainining has been selected
                if (selectedAwards.length > 0) {
                    let filteredBasedOnSelectedAwards = await filterBasedOnSelectedAwards(formattedAwards)
                    if (sorting.columnToSort !== '') {
                        let orderedData = await orderData(filteredBasedOnSelectedAwards)
                        setFilteredAwards(orderedData)
                    } else {
                        setFilteredAwards(filteredBasedOnSelectedAwards)
                    }
                } else {
                    if (sorting.columnToSort !== '') {
                        let orderedData = await orderData(formattedAwards)
                        setFilteredAwards(orderedData)
                    } else {
                        setFilteredAwards(formattedAwards)
                    }
                }
            }
        }

        filterData()
    }, [sorting, selectedAwards, formattedAwards])

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

    const handleSelectedAwardsChange = (e) => {
        setSelectedAwards(e.target.value)
    }

    const handleReset = () => {
        setSelectedAwards([])
    }

    if (upcomingAwardsFailed) return (<BasicError error={upcomingAwardErrorData.data} />)
    if (fetchedAwardFailed) return (<BasicError error={fetchedAwardErrorData.data} />)

    return (
        <Box p={2}>
            <UpcomingTitle title="Upcoming Awards" expanded={expanded} setExpanded={setExpanded} />
            <Collapse in={expanded} unmountOnExit>
                <FilterSelectionContainer
                    fetchedAwardSuccess={fetchedAwardSuccess}
                    fetchedAwards={fetchedAwards}
                    selectedAwards={selectedAwards}
                    handleSelectedAwardsChange={handleSelectedAwardsChange}
                    handleReset={handleReset}
                />
                <UpcomingAwardsDisplay
                    filteredAwards={filteredAwards}
                    sorting={sorting}
                    handleSortChange={handleSortChange}
                    loading={fetchingUpcomingAwards}
                />
            </Collapse>
        </Box>
    );
}

function FilterSelectionContainer(props) {
    let filterSelect = null
    if (props.fetchedAwardSuccess) {
        filterSelect = <FilterSelect
            options={props.fetchedAwards}
            selected={props.selectedAwards}
            emptyLabel="All Awards"
            handleSelectedChange={(e) => props.handleSelectedAwardsChange(e)}
        />
    } else {
        filterSelect = <FilterSelect
            options={[]}
            selected={[]}
            emptyLabel="All Awards"
            disabled
        />
    }

    return (
        <Grid container spacing={2} paddingBottom={2} wrap='nowrap'>
            <Grid item>
                {filterSelect}
            </Grid>
            <Grid item>
                <ResetButton handleReset={() => props.handleReset()} />
            </Grid>
        </Grid>
    )
}

function UpcomingAwardsDisplay(props) {
    if (props.filteredAwards && props.filteredAwards.length > 0) {
        return (
            <TableContainer component={Paper}>
                <UpcomingAwardsTable
                    sorting={props.sorting}
                    handleSortChange={props.handleSortChange}
                    filteredData={props.filteredAwards}
                    loading={props.fetchingUpcomingAwards}
                />
            </TableContainer>
        )
    } else {
        return <UpcomingEmpty message="No awards upcoming in the given timeframe" />
    }
}