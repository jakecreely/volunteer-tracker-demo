import * as React from 'react';
import Box from '@mui/material/Box';
import Title from '../../../components/Title';
import { TableContainer, Paper, Grid, Collapse } from '@mui/material'
import orderBy from 'lodash/orderBy'
import UpcomingAwardsTable from './UpcomingAwardsTable';
import { FilterSelect } from '../../../components/FilterSelect';
import { ResetButton } from '../../../components/ResetButton';
import { ExpandButton } from '../../../components/ExpandButton';
import { useGetAwardsQuery, useGetUpcomingAwardsQuery } from '../../../lib/apiSlice';
import { UpcomingEmpty } from '../../../components/Empty';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton';

export default function AwardCard(props) {

    const [sorting, setSorting] = React.useState({ columnToSort: '', sortDirection: '' })
    const [defaultDirection, setDefaultDirection] = React.useState('asc')
    const [selectedAwards, setSelectedAwards] = React.useState([])
    const [filteredAwards, setFilteredAwards] = React.useState([])
    const [formattedAwards, setFormattedAwards] = React.useState([])
    const [expanded, setExpanded] = React.useState(true);

    // Get the upcoming award data, refetch when the filterTime prop changes
    const {
        data: upcomingAwards,
        isLoading: upcomingAwardsLoading,
        isSuccess: upcomingAwardsSuccess,
        error: upcomingAwardError
    } = useGetUpcomingAwardsQuery(props.filterTime)

    // Get the training data
    const {
        data: fetchedAwards,
        isLoading: fetchedAwardLoading,
        isSuccess: fetchedAwardSuccess,
        error: fetchedAwardError
    } = useGetAwardsQuery()

    React.useEffect(() => {
        if (upcomingAwardsSuccess) {
            setSorting({ columnToSort: 'award.achievedDate', sortDirection: 'asc' })
        }
    }, [upcomingAwardsSuccess])

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

    // const handleSortChange = (column) => {
    //     let columnsToSort = []
    //     let sortDirection = []

    //     if (sorting.columnsToSort.length !== 0) {
    //         let found = false
    //         sorting.columnsToSort.map((item, index) => {
    //             // If the column is already in the array, reverse the direction
    //             if (item === column) {
    //                 columnsToSort.push(item)
    //                 sortDirection.push(sorting.sortDirection[index] === 'asc' ? 'desc' : 'asc')
    //                 found = true
    //             }
    //         })
    //         if (!found) {
    //             columnsToSort.push(column)
    //             sortDirection.push(defaultDirection)
    //         }
    //     } else {
    //         columnsToSort.push(column)
    //         sortDirection.push(defaultDirection)
    //     }
    //     setSorting({ columnsToSort, sortDirection })
    // }

    React.useEffect(() => {
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

    React.useEffect(() => {
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

    // React.useEffect(() => {
    //     //Filter the upcoming training based on selected values
    //     const filterDataBasedOnSelected = async (data) => {
    //         let filteredData = []
    //         data.map((item) => {
    //             if (selected.includes(item.award_name)) {
    //                 filteredData.push(item)
    //             }
    //         })
    //         return filteredData
    //     }

    //     const sortData = async (data) => {
    //         let orderedData = orderBy(data, sorting.columnsToSort, sorting.sortDirection)
    //         return orderedData
    //     }

    //     if (props.data) {
    //         if (selected.length > 0) {
    //             filterDataBasedOnSelected(props.data).then(filteredData => {
    //                 if (sorting.columnsToSort.length > 0) {
    //                     sortData(filteredData).then(orderedData => {
    //                         setFilteredData(orderedData)
    //                     })
    //                 } else {
    //                     setFilteredData(filteredData)
    //                 }
    //             })
    //         } else {
    //             if (sorting.columnsToSort.length > 0) {
    //                 sortData(props.data).then(orderedData => {
    //                     setFilteredData(orderedData)
    //                 })
    //             } else {
    //                 setFilteredData(props.data)
    //             }
    //         }
    //     }
    // }, [sorting, selected, props.data])

    const handleSelectedAwardsChange = (e) => {
        setSelectedAwards(e.target.value)
    }

    const handleReset = () => {
        setSelectedAwards([])
        //setSorting({ columnToSort: '', sortDirection: '' })
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
                    <Grid container spacing={2} paddingBottom={2} wrap='nowrap'>
                        <Grid item>
                            {fetchedAwardLoading ?
                                <FilterSelect
                                    options={[]}
                                    selected={[]}
                                    emptyLabel="All Awards"
                                    disabled
                                />
                                :
                                <FilterSelect
                                    options={fetchedAwards}
                                    selected={selectedAwards}
                                    emptyLabel="All Awards"
                                    handleSelectedChange={(e) => handleSelectedAwardsChange(e)}
                                />
                            }
                        </Grid>
                        <Grid item>
                            {!fetchedAwardError && <ResetButton handleReset={() => handleReset()} />}
                        </Grid>
                    </Grid>
                    {upcomingAwardsSuccess ?
                        (filteredAwards && filteredAwards.length > 0 ?
                        <TableContainer component={Paper}>
                            <UpcomingAwardsTable
                                sorting={sorting}
                                handleSortChange={handleSortChange}
                                filteredData={filteredAwards}
                                loading={upcomingAwardsLoading}
                            />
                        </TableContainer>
                        : <UpcomingEmpty message="No awards upcoming in the given timeframe" />
                        )
                        : upcomingAwardError ?
                        "Error fetching upcoming awards. Please try again later." :
                        <LoadingTableSkeleton />
                    }
                </Collapse>
            </Box>
        </React.Fragment>
    );
}