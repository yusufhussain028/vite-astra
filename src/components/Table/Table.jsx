import * as React from 'react';
import { styled } from '@mui/material/styles';
import './table.css'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Input, InputLabel } from '@mui/material';
import { FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#F5F5F7',
        color: '#000',
        textAlign: 'center', // Center align header cells
        padding: '5px', // Adjust padding as needed to align with body cells
        fontSize: '0.785rem', // Small font size
        fontWeight: 'bold', // Bold font weight
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        textAlign: 'center', // Center align body cells
        padding: '8px', // Adjust padding as needed to align with header cell
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#fff',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
    '& > *': {
        textAlign: 'center', // Align all children elements to center
    },
}));

function createData(id, calories, fat, carbs, protein, link) {
    return { id, calories, fat, carbs, protein, link };
}

const rows = [
    createData(1, '1.0', 'dummyName1', 'Go To Project'),
    createData(2, '2.0', 'dummyName2', 'Go To Project'),
    createData(3, '3.0', 'dummyName3', 'Go To Project'),
    createData(4, '4.0', 'dummyName4', 'Go To Project'),
    createData(5, '5.0', 'dummyName5', 'Go To Project'),
];

export default function CustomizedTables() {
    const [selected, setSelected] = React.useState([]);
    const [openModal, setOpenModal] = React.useState(false);
    const navigate = useNavigate();

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = rows.map((row) => row.id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = [...selected, id];
        } else if (selectedIndex === 0) {
            newSelected = [...selected.slice(1)];
        } else if (selectedIndex === selected.length - 1) {
            newSelected = [...selected.slice(0, -1)];
        } else if (selectedIndex > 0) {
            newSelected = [
                ...selected.slice(0, selectedIndex),
                ...selected.slice(selectedIndex + 1),
            ];
        }

        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleCreateProject = () => {
        // alert("creating");
        setOpenModal(false);
        navigate('/createdProjects');
    }

    const handleGoToProjects = () => {
        navigate('/drawer');
    }

    return (
        <>
            <h3>PROJECT LIST</h3>
            <div className="pageSize">
                <p style={{ color: "#B6B7C0" }}>show</p>
                <button id="btnCreate" onClick={handleOpenModal}>+ CREATE PROJECT</button>
            </div>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>
                                <Checkbox
                                    color="primary"
                                    indeterminate={selected.length > 0 && selected.length < rows.length}
                                    checked={selected.length === rows.length}
                                    onChange={handleSelectAllClick}
                                />
                            </StyledTableCell>
                            <StyledTableCell>SR.NO</StyledTableCell>
                            <StyledTableCell align="center">PROJECT REFERENCE&nbsp;</StyledTableCell>
                            <StyledTableCell align="center">PROJECT NAME&nbsp;</StyledTableCell>
                            <StyledTableCell align="center">PROJECT LINK&nbsp;</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <StyledTableRow
                                key={row.id}
                                hover
                                onClick={(event) => handleClick(event, row.id)}
                                role="checkbox"
                                aria-checked={isSelected(row.id)}
                                selected={isSelected(row.id)}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        checked={isSelected(row.id)}
                                    />
                                </TableCell>
                                <StyledTableCell component="th" scope="row">
                                    {row.id}
                                </StyledTableCell>
                                <StyledTableCell align="center">{row.calories}</StyledTableCell>
                                <StyledTableCell align="center">{row.fat}</StyledTableCell>
                                <StyledTableCell align="center">
                                    <a
                                        href={row.link}
                                        onClick={handleGoToProjects}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#666cff', textDecoration: 'none', cursor: 'pointer' }}
                                    >
                                        {row.carbs}
                                    </a>
                                </StyledTableCell>
                                <StyledTableCell align="center">{row.protein}</StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <div>
                <p style={{ color: '#B6B7C0' }}>showing 5 of 5 entries</p>
            </div>

            {/* Modal Component */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 4, // Border radius for the modal content
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
                        NEW PROJECT DETAILS
                    </Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel htmlFor="Project Reference">Project Reference</InputLabel>
                        <Input id="floor-name" />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel htmlFor="Name">Name</InputLabel>
                        <Input id="floor-abbreviation" />
                    </FormControl>
                        <div className='modalBtnClass'>
                            <Button onClick={handleCloseModal} variant="contained" color="primary" style={{ backgroundColor: "#fff", borderRadius: "5px solid grey", color: "#000" }}>
                                CANCEL
                            </Button>
                            <Button onClick={handleCreateProject} variant="contained" color="primary" style={{ backgroundColor: "#666cff" }}>
                                CREATE
                            </Button>
                        </div>
                </Box>
            </Modal>
        </>
    );
}