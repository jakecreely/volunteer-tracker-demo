import * as React from 'react';
import Box from '@mui/material/Box';
import Title from '../../../components/Title';
import { useNavigate } from 'react-router-dom';
import { TableContainer, Paper, Grid, Collapse } from '@mui/material'
import { FilterSelect } from '../../../components/filter/FilterSelect';
import { ResetButton } from '../../../components/filter/ResetButton';
import orderBy from 'lodash/orderBy'
import { ExpandButton } from '../../../components/navigation/ExpandButton';
import { useGetDocumentsQuery, useGetOutstandingDocumentsQuery } from '../../../features/api/apiSlice';
import { UpcomingDocumentsTable } from './UpcomingDocumentsTable';
import { UpcomingEmpty } from '../../../components/Empty';
import { LoadingTableSkeleton } from '../LoadingTableSkeleton';

export default function DocumentCard(props) {

    const [sorting, setSorting] = React.useState({ columnToSort: '', sortDirection: 'asc' })
    const [defaultDirection, setDefaultDirection] = React.useState('asc')
    const [selectedDocuments, setSelectedDocuments] = React.useState([])
    const [filteredDocuments, setFilteredDocuments] = React.useState([])
    const [formattedDocuments, setFormattedDocuments] = React.useState([])
    const [expanded, setExpanded] = React.useState(true);

    // Get the upcoming award data, refetch when the filterTime prop changes
    const {
        data: outstandingDocuments,
        isLoading: outstandingDocumentsLoading,
        isSuccess: outstandingDocumentsSuccess,
        error: outstandingDocumentsError
    } = useGetOutstandingDocumentsQuery(props.filterTime)

    // Get the training data
    const {
        data: fetchedDocuments,
        isLoading: fetchedDocumentsLoading,
        isSuccess: fetchedDocumentsSuccess,
        error: fetchedDocumentsError
    } = useGetDocumentsQuery()

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

    React.useEffect(() => {
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

    React.useEffect(() => {
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

    // React.useEffect(() => {
    //     //Filter the upcoming training based on selected values
    //     const filterDataBasedOnSelected = async (data) => {
    //         let filteredData = []
    //         data.map((item) => {
    //             let found = false
    //             selected.map(selectedItem => {
    //                 if (!item.recruitmentDocuments[selectedItem]) {
    //                     found = true
    //                 }
    //             })
    //             if (found) {
    //                 filteredData.push(item)
    //             }
    //         })
    //         return filteredData
    //     }

    //     if (props.data) {
    //         if (selected.length > 0) {
    //             filterDataBasedOnSelected(props.data).then(filteredData => {
    //                 setFilteredData(filteredData)
    //             })
    //         } else {
    //             setFilteredData(props.data)
    //         }
    //     }
    // }, [sorting, selected, props.data])

    const handleSelectedDocumentsChange = (e) => {
        setSelectedDocuments(e.target.value)
    }

    const handleReset = () => {
        setSelectedDocuments([])
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
                    <Grid container spacing={2} paddingBottom={2} wrap='nowrap'>
                        <Grid item>
                            {fetchedDocumentsLoading ?
                                <FilterSelect
                                    options={[]}
                                    selected={[]}
                                    emptyLabel="All Documents"
                                    disabled
                                />
                                :
                                <FilterSelect
                                    options={fetchedDocuments}
                                    selected={selectedDocuments}
                                    emptyLabel="All Documents"
                                    handleSelectedChange={(e) => handleSelectedDocumentsChange(e)}
                                />
                            }
                        </Grid>
                        <Grid item>
                            <ResetButton handleReset={() => handleReset()} />
                        </Grid>
                    </Grid>
                    {outstandingDocumentsSuccess ? 
                        (filteredDocuments && filteredDocuments.length > 0 ?
                        <TableContainer component={Paper}>
                            <UpcomingDocumentsTable
                                sorting={sorting}
                                handleSortChange={handleSortChange}
                                filteredData={filteredDocuments}
                                loading={outstandingDocumentsLoading}
                            />
                        </TableContainer>
                        : <UpcomingEmpty message="No documents outstanding" />
                        )
                        : outstandingDocumentsError ?
                        "No Document Added. Please add a document in the Documents page." :
                        <LoadingTableSkeleton />
                    }
                </Collapse>
            </Box>
        </React.Fragment>
    );
}