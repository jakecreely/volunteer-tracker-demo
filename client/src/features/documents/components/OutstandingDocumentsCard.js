import Box from '@mui/material/Box';
import { TableContainer, Paper, Grid, Collapse } from '@mui/material'
import { FilterSelect } from '../../../components/FilterSelect';
import { ResetButton } from '../../../components/ResetButton';
import orderBy from 'lodash/orderBy'
import { useGetDocumentsQuery, useGetOutstandingDocumentsQuery } from '../../../lib/apiSlice';
import UpcomingDocumentsTable from './UpcomingDocumentsTable';
import { UpcomingEmpty } from '../../../components/UpcomingEmpty';
import { useEffect, useState } from 'react';
import { UpcomingTitle } from '../../../components/UpcomingTitle';

export function OutstandingDocumentsCard(props) {
    const [sorting, setSorting] = useState({ columnToSort: '', sortDirection: 'asc' })
    const [selectedDocuments, setSelectedDocuments] = useState([])
    const [filteredDocuments, setFilteredDocuments] = useState([])
    const [formattedDocuments, setFormattedDocuments] = useState([])
    const [expanded, setExpanded] = useState(true);
    const defaultDirection = 'asc'
    const defaultColumn = 'document.dueDate'

    // Get the upcoming award data, refetch when the filterTime prop changes
    const {
        data: outstandingDocuments,
        isLoading: fetchingOutstandingDocuments,
        isSuccess: outstandingDocumentsSuccess,
        isError: outstandingDocumentsFailed,
        error: outstandingDocumentsError
    } = useGetOutstandingDocumentsQuery(props.filterTime)

    // Get the training data
    const {
        data: fetchedDocuments,
        isLoading: fetchingDocuments,
        isSuccess: fetchedDocumentsSuccess,
        isError: fetchedDocumentsFailed,
        error: fetchedDocumentsError
    } = useGetDocumentsQuery()

    useEffect(() => {
        // Once the data is fetched, format it for the table
        if (outstandingDocumentsSuccess) {
            let formattedOutstandingDocuments = []
            outstandingDocuments.forEach(volunteerWithDocuments => {
                if (!volunteerWithDocuments.volunteer.isArchived) {
                    volunteerWithDocuments.missingDocuments.forEach(missingDocument => {
                        formattedOutstandingDocuments.push({
                            volunteer: volunteerWithDocuments.volunteer,
                            document: missingDocument
                        })
                    })
                    volunteerWithDocuments.outstandingDocuments.forEach(outstandingDocument => {
                        formattedOutstandingDocuments.push({
                            volunteer: volunteerWithDocuments.volunteer,
                            document: outstandingDocument
                        })
                    })
                }
                return formattedOutstandingDocuments
            })
            setFilteredDocuments(formattedOutstandingDocuments)
            // The base data that is not, used for resetting the table
            setFormattedDocuments(formattedOutstandingDocuments)
        }
    }, [outstandingDocuments])

    useEffect(() => {
        //Filter the upcoming training based on selected values
        const filterBasedOnSelectedDocuments = async (outstandingDocuments) => {
            let filteredData = []
            outstandingDocuments.forEach(volunteerWithDocuments => {
                if (selectedDocuments.includes(volunteerWithDocuments.document.name)) {
                    filteredData.push(volunteerWithDocuments);
                }
            });
            return filteredData
        }

        // Order the upcoming training based on the selected column and direction
        const orderData = async (outstandingDocuments) => {
            let orderedData = orderBy(outstandingDocuments, sorting.columnToSort, sorting.sortDirection)
            return orderedData
        }

        // Wrapper for async functionality
        const filterData = async () => {
            if (outstandingDocumentsSuccess && formattedDocuments.length > 0) {
                // If has trainining has been selected
                if (selectedDocuments.length > 0) {
                    let filteredBasedOnSelectedDocuments = await filterBasedOnSelectedDocuments(formattedDocuments)
                    if (sorting.columnToSort !== '') {
                        let orderedData = await orderData(filteredBasedOnSelectedDocuments)
                        setFilteredDocuments(orderedData)
                    } else {
                        setFilteredDocuments(filteredBasedOnSelectedDocuments)
                    }
                } else {
                    if (sorting.columnToSort !== '') {
                        let orderedData = await orderData(formattedDocuments)
                        setFilteredDocuments(orderedData)
                    } else {
                        setFilteredDocuments(formattedDocuments)
                    }
                }
            }
        }

        filterData()
    }, [sorting, selectedDocuments])

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

    const handleSelectedDocumentsChange = (e) => {
        setSelectedDocuments(e.target.value)
    }

    const handleReset = () => {
        setSelectedDocuments([])
        setSorting({ columnToSort: defaultColumn, sortDirection: defaultDirection })
    }

    return (
        <Box p={2}>
            <UpcomingTitle title="Outstanding Documents" expanded={expanded} setExpanded={setExpanded} />
            <Collapse in={expanded} unmountOnExit>
                <FilterSelectionContainer
                    fetchedDocuments={fetchedDocuments}
                    fetchedDocumentsSuccess={fetchedDocumentsSuccess}
                    selectedDocuments={selectedDocuments}
                    handleSelectedDocumentsChange={(e) => handleSelectedDocumentsChange(e)}
                    handleReset={() => handleReset()}
                />
                <OutstandingDocumentsDisplay
                    sorting={sorting}
                    handleSortChange={handleSortChange}
                    filteredDocuments={filteredDocuments}
                    fetchingOutstandingDocuments={fetchingOutstandingDocuments}
                />
            </Collapse>
        </Box>
    );
}

function FilterSelectionContainer(props) {
    let filterSelect = null
    if (props.fetchedDocumentsSuccess) {
        filterSelect = <FilterSelect
            options={props.fetchedDocuments}
            selected={props.selectedDocuments}
            emptyLabel="All Documents"
            handleSelectedChange={(e) => props.handleSelectedDocumentsChange(e)}
        />
    } else {
        filterSelect = <FilterSelect
            options={[]}
            selected={[]}
            emptyLabel="All Documents"
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

function OutstandingDocumentsDisplay(props) {
    if (props.filteredDocuments && props.filteredDocuments.length > 0) {
        return (
            <TableContainer component={Paper}>
                <UpcomingDocumentsTable
                    sorting={props.sorting}
                    handleSortChange={props.handleSortChange}
                    filteredData={props.filteredDocuments}
                    loading={props.fetchingOutstandingDocuments}
                />
            </TableContainer>
        )
    } else {
        return (<UpcomingEmpty message="No documents outstanding" />)
    }
}