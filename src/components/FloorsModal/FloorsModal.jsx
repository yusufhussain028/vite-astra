import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import './floorsModal.css';
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
import { Input, InputLabel } from '@mui/material';
import { FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VerticalMenu from '../MenuButton/MenuBtn.jsx';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#F5F5F7',
        color: '#000',
        textAlign: 'center', // Center align header cells
        padding: '0', // Adjust padding as needed to align with body cells
        fontSize: '0.685rem', // Small font size
        fontWeight: 'bold', // Bold font weight
    },
    [`&.${tableCellClasses.body}`]: {
        textAlign: 'center', // Center align body cells
        padding: '0', // Adjust padding as needed to align with header cell
        fontSize: '0.655rem', // Small font size
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

function createData(id, name, calories, fat, carbs, protein, link) {
    return { id, name, calories, fat, carbs, protein, link };
}

const rows = [
    createData('createdTest1', 1.0, <VerticalMenu />),
    createData('createdTest2', 2.0, <VerticalMenu />),
    createData('createdTest3', 3.0, <VerticalMenu />),
    createData('createdTest4', 4.0, <VerticalMenu />),
    createData('createdTest5', 5.0, <VerticalMenu />),
];

const FloorsModal = ({ open, onClose }) => {
    const [selected, setSelected] = React.useState([]);
    const [openAddFloorModal, setOpenAddFloorModal] = React.useState(false);
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

    const handleOpenAddFloorModal = () => {
        onClose();
        setOpenAddFloorModal(true);
    };

    const handleCloseAddFloorModal = () => {
        setOpenAddFloorModal(false);
    };

    const handleCreateProject = () => {
        alert("Creating new floor...");
        handleCloseAddFloorModal();
    };

    const handleDeleteSelected = () => {
        // Implement your delete logic here
        alert("Deleting selected floors...");
    };

    const handleGoToProjects = () => {
        navigate('/drawer');
    };

    debugger;
    const allSelected = selected.length === rows.length || selected.length > 1;

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                aria-labelledby="floors-modal-title"
                aria-describedby="floors-modal-description"
                maxWidth="md"
                fullWidth
            >
                <DialogTitle id="floors-modal-title">Select Floors</DialogTitle>
                <DialogContent>
                    <div className="pageSize">
                        <p style={{ color: "#B6B7C0" }}>show</p>
                        {allSelected && (
                            <button id="btnDelete" onClick={handleDeleteSelected} style={{ fontSize: "10px", marginLeft: "75%", cursor: "pointer" }}>
                                DELETE
                            </button>
                        )}
                        <button id="btnCreate" onClick={handleOpenAddFloorModal} style={{ fontSize: "10px" }}>+ ADD FLOOR</button>
                    </div>
                    <TableContainer component={Paper} style={{ maxHeight: '400px' }}>
                        <Table sx={{ minWidth: 700 }} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>
                                        <Checkbox
                                            color="primary"
                                            indeterminate={selected.length > 0 && selected.length < rows.length}
                                            checked={allSelected}
                                            onChange={handleSelectAllClick}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell align="center">FLOOR NAME</StyledTableCell>
                                    <StyledTableCell align="center">FLOOR ABBREVATIONS&nbsp;</StyledTableCell>
                                    <StyledTableCell align="center">ACTIONS&nbsp;</StyledTableCell>
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
                                        <StyledTableCell align="center">{row.name}</StyledTableCell>
                                        <StyledTableCell align="center">{row.calories}</StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <div>
                        <p style={{ color: '#B6B7C0' }}>showing {rows.length} of {rows.length} entries</p>
                    </div>
                </DialogContent>
                <DialogActions style={{cursor: "pointer"}}>
                    <Button onClick={onClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal for Adding Floor */}
            <Modal
                open={openAddFloorModal}
                onClose={handleCloseAddFloorModal}
                aria-labelledby="add-floor-modal-title"
                aria-describedby="add-floor-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="add-floor-modal-title" variant="h6" component="h2">
                        Add New Floor
                    </Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel htmlFor="floor-name">Floor Name</InputLabel>
                        <Input id="floor-name" />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel htmlFor="floor-abbreviation">Floor Abbreviation</InputLabel>
                        <Input id="floor-abbreviation" />
                    </FormControl>
                    <Box mt={2}>
                        <div className='modalBtnClass'>
                            <Button onClick={handleCloseAddFloorModal} variant="contained" color="primary" style={{ backgroundColor: "#fff", border: "1px solid grey", borderRadius: "5px", color: "#000" }}>
                                CANCEL
                            </Button>
                            <Button onClick={handleCreateProject} variant="contained" color="primary" style={{ backgroundColor: "#666cff" }}>
                                + ADD
                            </Button>
                        </div>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default FloorsModal;