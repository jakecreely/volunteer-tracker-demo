import { Alert, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material"
import { useEffect, useState } from "react";

export function ImportedVolunteersTable(props) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        if (props.importVolunteersSuccess) {
            setPage(0)
        }
    }, [props.importVolunteersSuccess])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - props.editedVolunteers.length) : 0;

    let emptyRowsFilled = []
    if (emptyRows > 0) {
        for (let i = 0; i < emptyRows; i++) {
            emptyRowsFilled.push(<TableRow style={{ border: 'none' }} />)
        }
    }

    return (
        <TableContainer component={Paper}>
            <Table size="small" aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Volunteer Name</TableCell>
                        <TableCell>Errors</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        props.editedVolunteers && props.editedVolunteers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage,).map((elem, index) => {
                            let newIndex = page * rowsPerPage + index
                            if (elem.errors.length === 0) {
                                return <TableRow key={elem.volunteer.name} sx={elem.skipped ? { backgroundColor: '#f5f5f5' } : {}}>
                                    <TableCell>{elem.volunteer.name}</TableCell>
                                    <TableCell>
                                        <Alert severity="success">No Errors</Alert>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outlined" onClick={(e) => {
                                            props.setSelectedVolunteer(elem)
                                            props.setSelectedIndex(newIndex)
                                            props.setModalOpen(true)
                                        }}>View Volunteer</Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outlined" onClick={() => props.handleSkipVolunteer(newIndex)}>
                                            {elem.skipped ? "Keep Volunteer" : "Skip Volunteer"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            }

                            const allErrorsFixed = elem.errors.every((elem) => { return elem.fixed === true })
                            const errorIsDuplicateVolunteer = elem.errors.some((elem) => { return elem.type === 'duplicateVolunteer' })
                            if (errorIsDuplicateVolunteer) {
                                return <TableRow key={elem.volunteer.name} sx={elem.skipped ? { backgroundColor: '#f5f5f5' } : {}}>
                                    <TableCell>{elem.volunteer.name}</TableCell>
                                    <TableCell>
                                        <Alert severity="warning">Duplicate of a volunteer already added</Alert>
                                    </TableCell>
                                    <TableCell>
                                    </TableCell>
                                    <TableCell>

                                    </TableCell>
                                </TableRow>
                            }

                            const errorsFixed = elem.errors.filter((elem) => { return elem.fixed === true })
                            return <TableRow key={elem.volunteer.name} sx={elem.skipped ? { backgroundColor: '#f5f5f5' } : {}}>
                                <TableCell>{elem.volunteer.name}</TableCell>
                                <TableCell>
                                    <Alert severity={allErrorsFixed ? "success" : "warning"}>
                                        {errorsFixed.length} Out Of {elem.errors.length} Errors Fixed
                                    </Alert>
                                </TableCell>
                                <TableCell>
                                    <Button variant="outlined" onClick={(e) => {
                                        props.setSelectedVolunteer(elem)
                                        props.setSelectedIndex(newIndex)
                                        props.setModalOpen(true)
                                    }}>Fix Errors</Button>
                                </TableCell>
                                <TableCell>
                                    <Button variant="outlined" onClick={() => {
                                        props.handleSkipVolunteer(newIndex)
                                    }}>
                                        {elem.skipped ? "Keep Volunteer" : "Skip Volunteer"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        })
                    }
                    {emptyRows > 0 && (
                        <TableRow
                            style={{
                                height: 60 * emptyRows,
                            }}
                        >
                            <TableCell colSpan={6} />
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={props.editedVolunteers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableContainer>
    )
}