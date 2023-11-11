import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, TablePagination, Skeleton, Box } from '@mui/material'
import { SortableCell } from '../../../components/SortableCell';

export function UpcomingAwardsTable(props) {
    const navigate = useNavigate()
    const moment = require('moment');

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
                        <SortableCell {...props} id="volunteer.name" label="User" />
                        <SortableCell {...props} id="award.name" label="Award" />
                        <SortableCell {...props} id="award.achievedDate" label="Achieved Date" />
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* TODO: Include isArchived in api response and add check here so they are not included} */}
                    {props.filteredData && props.filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((elem, index) => (
                        <TableRow key={elem.volunteer._id + index}>
                            <TableCell width={'35%'} component="th" scope="row">{elem.volunteer.name}</TableCell>
                            <TableCell width={'25%'}>{elem.award.name}</TableCell>
                            <TableCell width={'25%'}>{moment(elem.award.achievedDate).format("DD-MM-YYYY")}</TableCell>
                            <TableCell width={'15%'}><Button variant="text" onClick={() => navigate('/dashboard/volunteer/' + elem.volunteer._id)}>{"Profile"}</Button></TableCell>
                        </TableRow>
                    ))}
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