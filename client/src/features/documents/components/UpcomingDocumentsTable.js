import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, TablePagination, Skeleton } from '@mui/material'

export default function UpcomingDocumentsTable(props) {
    const navigate = useNavigate()

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    React.useEffect(() => {
        setPage(0)
    }, [props.filteredData])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - props.filteredData.length) : 0;

    let emptyRowsFilled = []
    if (emptyRows > 0) {
        for (let i = 0; i < emptyRows; i++) {
            emptyRowsFilled.push(<TableRow style={{ border: 'none' }} />)
        }
    }

    if (props.loading) {
        return (
            <Skeleton variant='wave' />
        )
    }


    return (
        <React.Fragment>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Required Document</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.filteredData && props.filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage,).map((elem, index) => (
                        <TableRow key={elem.volunteer._id + index}>
                            <TableCell width={'40%'} component="th" scope="row">{elem.volunteer.name}</TableCell>
                            <TableCell width={'40%'}>{elem.document.name}</TableCell>
                            <TableCell width={'20%'}><Button variant="text" onClick={() => navigate('/dashboard/volunteer/' + elem.volunteer._id)}>{"Profile"}</Button></TableCell>
                        </TableRow>
                    ))
                    }
                    {emptyRows > 0 && (
                        <TableRow
                            style={{
                                height: 52 * emptyRows,
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
                count={props.filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </React.Fragment>
    )
}