import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import ruler from '../../images/ruler-measurement-icon.png';
import floorsIcon from '../../images/pngegg.png';
import pipeIcon from '../../images/pipeline.png';
import wallIcon from '../../images/wall.png';
import AdUnitsIcon from '@mui/icons-material/AdUnits';
import SettingsIcon from '@mui/icons-material/Settings';
import LayersIcon from '@mui/icons-material/Layers';
import ChatIcon from '@mui/icons-material/Chat';
import SaveIcon from '@mui/icons-material/Save';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { SketchPicker } from 'react-color';
import { FormControl, InputLabel, Select, MenuItem, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import TableComponent from './../FluentUITable/FluentUITable.jsx';
import DrawingTool from '../Paper/PaperFile.jsx';
import Popover from '@mui/material/Popover';
import goBack from '../../images/go-back.png';
import drawIcon from '../../images/drawicon.png';
import ThicknessIcon from '../../images/thickness-icon.png';
import { useNavigate } from 'react-router-dom';
import WallTableComponent from '../WallTable/WallTable.jsx';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }),
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export default function ResponsiveDrawer() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalContent, setModalContent] = React.useState('');
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [transparency, setTransparency] = React.useState(70);
    const [gridTransparency, setGridTransparency] = React.useState(20);
    const [selectedUnits, setSelectedUnits] = React.useState('');
    const [unitsModalOpenCount, setUnitsModalOpenCount] = React.useState(0);
    const [unitsModalAgain, setUnitsModalAgain] = React.useState(false);
    const [unitsDisabled, setUnitsDisabled] = React.useState(false);
    const [settingsAnchorEl, setSettingsAnchorEl] = React.useState(null);
    const [imageSwitchOn, setImageSwitchOn] = React.useState(false);
    const [gridSwitch, setGridSwitch] = React.useState(true);
    const [snapGrid, setSnapGrid] = React.useState(false);
    const [uploadedImage, setUploadedImage] = React.useState(null);
    const [uploadedImageName, setUploadedImageName] = React.useState('');
    const [deleteImage, setDeleteImage] = React.useState(false);
    const [dummyQuestionModalOpen, setDummyQuestionModalOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [uploadBtn, setUploadBtn] = React.useState(false);
    const [currentDimensions, setCurrentDimensions] = React.useState('');
    const [newDimensions, setNewDimensions] = React.useState('');
    const [newScale, setNewScale] = React.useState(1);
    const [showCornerText, setShowCornerText] = React.useState(false);
    const [distanceToolEnabled, setDistanceToolEnabled] = React.useState(true);
    const [moveImage, setMoveImage] = React.useState(false);
    const [isImageMoved, setIsImageMoved] = React.useState(false);
    const [buttonColor, setButtonColor] = React.useState('primary');
    const [drawWalls, setDrawWalls] = React.useState(false);
    const [gridScaleValue, setGridScaleValue] = React.useState(1);
    const [gridColor, setGridColor] = React.useState('#000000');
    const [colorPickerOpen, setColorPickerOpen] = React.useState(false);
    const [colorPickerPosition, setColorPickerPosition] = React.useState({ top: 50, left: 50 });
    const [gridUnit, setGridUnit] = React.useState('meter');
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);


    const customCanvasStyle = {
        backgroundColor: '#fff',
        position: "absolute",
        width: "100vw",
        height: "100vh"
    };

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleMenuItemClick = (text) => {
        if (text === 'Units') {
            setUnitsModalOpenCount(prevCount => prevCount + 1);
            if (unitsModalOpenCount > 0) {
                setUnitsModalAgain(true);
                setUnitsDisabled(true);
            }
        }
        setModalContent(text);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleSettingsClick = (event) => {
        setSettingsAnchorEl(event.currentTarget);
        setSettingsOpen(!settingsOpen);
    };

    const handleCloseSettingsClick = () => {
        setSettingsOpen(false);
        setSettingsAnchorEl(null);
    };

    const handleSliderChange = (event, newValue) => {
        setTransparency(event.target.value);
    };

    const handleGridSliderChange = (event, newValue) => {
        setGridTransparency(event.target.value);
    };

    const handleGridScaleValue = (event) => {
        if (/^\d*\.?\d{0,1}$/.test(event.target.value)) {
            setGridScaleValue(event.target.value);
        } else {
            setSnackbarOpen(true);
            return;
        }
    }

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleGridScaleUnitChange = (event) => {
        setGridUnit(event.target.value);
        if (event.target.value == 'feet') {
            setSelectedUnits('feet')
        }
        else if (event.target.value == 'in') {
            setSelectedUnits('in');
        }
        else if (event.target.value == 'cm') {
            setSelectedUnits('cm');
        }
        else if (event.target.value == 'mm') {
            setSelectedUnits('mm');
        }
        else if (event.target.value == 'meter') {
            setSelectedUnits('meter');
        }
    };

    const handleUnitsSelection = (units) => {
        setSelectedUnits(units);
    };

    const handleGoBack = () => {
        navigate('/vite-astra');
    }

    const handleDraw = () => {
        setDrawWalls(!drawWalls);
    }

    const handleImageSwitchChange = (event) => {
        setImageSwitchOn(event.target.checked);
    };

    const handleGridSwitch = (event) => {
        setGridSwitch(event.target.checked);
    }

    const handleMoveImage = () => {
        setMoveImage(!moveImage);
        setIsImageMoved(!isImageMoved);
        setButtonColor(isImageMoved ? 'primary' : 'secondary');
    }

    const handleUploadClick = () => {
        const uploadInput = document.createElement('input');
        uploadInput.type = 'file';
        uploadInput.accept = 'image/*';
        uploadInput.onchange = handleFileSelect;
        uploadInput.click();
        setDeleteImage(true);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setShowCornerText(true);
            setTimeout(() => {
                setShowCornerText(false);
                handleFileUpload(file);
            }, 2000);
        }
    };

    const handleFileUpload = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setUploadedImage(reader.result);
                setUploadedImageName(file.name);
                setUploadBtn(true);
            };
            reader.readAsDataURL(file);
            setSelectedFile(null);
        }
    };

    const handleDeleteImage = () => {
        setUploadedImage(null);
        setUploadedImageName('');
        setDeleteImage(false);
        setUploadBtn(false);
    };

    const handleChangeScale = () => {
        setDistanceToolEnabled(true);
    };

    const handleDistanceMeasured = (currentDim) => {
        setCurrentDimensions(`${currentDim} ${selectedUnits}`);
        setNewDimensions('');
        setDistanceToolEnabled(false);
        setDummyQuestionModalOpen(true);
    };

    const handleScaleChange = () => {
        const currentDim = parseFloat(currentDimensions);
        const newDim = parseFloat(newDimensions);
        if (currentDim > 0 && newDim > 0) {
            const relativeScale = newDim / currentDim;
            console.log(`Calculated Relative Scale: ${relativeScale}`);
            setNewScale(prevScale => prevScale * relativeScale);
        }
        setDummyQuestionModalOpen(false);
    };

    const handleColorChange = (color) => {
        setGridColor(color.hex);
        // You might want to add additional logic to update the grid color in your canvas or other component
    };

    const handleColorPickerOpen = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setColorPickerPosition({
            top: rect.top - 220, // Adjust this value as needed
            left: rect.left,
        });
        setColorPickerOpen(!colorPickerOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <div>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    sx={{ mr: 2, ...(open && { display: 'none' }) }}
                >
                    <MenuIcon style={{ marginLeft: "10px", zIndex: "999" }} />
                </IconButton>
            </div>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    {['Units', 'Floors', 'Manifold sizes'].map((text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton onClick={() => handleMenuItemClick(text)}>
                                <ListItemIcon>
                                    {index === 0 ? <AdUnitsIcon /> : ""}
                                    {index === 1 ? <img width="20" height="20" src={floorsIcon} alt="Floors Icon" /> : ""}
                                    {index === 2 ? <img width="20" height="20" src={ruler} alt="Ruler Icon" /> : ""}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                                {text === 'Units' && selectedUnits && (
                                    <Typography variant="caption" color="textSecondary">
                                        {selectedUnits}
                                    </Typography>
                                )}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List>
                    {['Piping', 'Rooms', 'Wall setup', 'Room schedule', 'Doors', 'Windows', 'Unheated areas', 'Grid'].map((text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton onClick={() => handleMenuItemClick(text)}>
                                <ListItemIcon>
                                    {index === 0 ? <img src={pipeIcon} width='20' height='20' alt='pipeIcon' /> : ""}
                                    {index === 2 ? <img src={wallIcon} width='20' height='20' alt='pipeIcon' /> : ""}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List>
                    {['Output'].map((text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton onClick={() => handleMenuItemClick(text)}>
                                <ListItemIcon>
                                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Main open={open}>
                <IconButton color="primary" onClick={handleGoBack} style={{ position: "absolute", top: "1%", left: "95%", zIndex: "999" }}>
                    <img src={goBack} height='20' width='20' />
                </IconButton>
                <IconButton color="primary" onClick={handleDraw} style={{ position: "absolute", top: "1%", left: "92%", zIndex: "999" }}>
                    <img src={drawIcon} height='20' width='20' />
                </IconButton>
                <Box
                    component="main"
                    sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
                >
                    <Toolbar />
                    <Typography paragraph>
                        <Box
                            sx={{
                                position: 'fixed',
                                top: '50%',
                                right: 16,
                                transform: 'translateY(-50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                zIndex: '999'
                            }}
                        >
                            <IconButton color="primary" onClick={handleSettingsClick}>
                                <SettingsIcon />
                            </IconButton>
                            <IconButton color="primary">
                                <LayersIcon />
                            </IconButton>
                            <IconButton color="primary">
                                <ChatIcon />
                            </IconButton>
                            <IconButton color="primary">
                                <SaveIcon />
                            </IconButton>
                        </Box>
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        position: 'relative',
                        left: "35%",
                        bottom: "35%",
                        width: "90vw",
                        height: "55vh",
                        zIndex: 0, // Ensure canvas is behind the modals
                    }}
                >
                    <DrawingTool
                        canvasStyle={customCanvasStyle}
                        transparency={transparency}
                        lockedImage={moveImage}
                        uploadImage={uploadedImage}
                        newScale={newScale}
                        onDistanceMeasured={handleDistanceMeasured}
                        toolEnabled={distanceToolEnabled}
                        selectedUnit={selectedUnits}
                        drawWalls={drawWalls}
                        gridTransparency={gridTransparency}
                        gridLineColor={gridColor}
                        gridScaleVal={gridScaleValue}
                    />
                </Box>
                {modalContent === 'Floors' && (
                    <Dialog
                        open={modalOpen}
                        onClose={handleModalClose}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                        PaperProps={{
                            style: { width: '900px', maxWidth: 'none', zIndex: 9999 }, // Higher z-index for the modal
                        }}
                    >
                        <DialogTitle id="modal-title" style={{ fontWeight: "bold", display: 'flex', justifyContent: 'center' }}>Select project {modalContent}</DialogTitle>
                        <DialogContent>
                            <TableComponent />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleModalClose} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
                {modalContent === 'Units' && (
                    <Dialog
                        open={modalOpen}
                        onClose={handleModalClose}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                        PaperProps={{
                            style: { width: '400px', maxWidth: 'none', zIndex: 9999 }, // Higher z-index for the modal
                        }}
                    >
                        <DialogTitle id="modal-title" style={{ fontWeight: "bold", display: 'flex', justifyContent: 'center' }}>Select project {modalContent}</DialogTitle>
                        <DialogContent>
                            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                                <div>
                                    <div style={{ paddingTop: "8px", paddingBottom: "8px", display: 'flex', justifyContent: 'center' }}>Imperial</div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Button disabled={unitsDisabled} variant="contained" color="primary" onClick={() => handleUnitsSelection('in')} style={{ backgroundColor: selectedUnits === 'in' ? "#666CFF" : "#fff", textTransform: 'lowercase', borderRadius: "5px solid grey", color: selectedUnits === 'in' ? "#fff" : "#000", marginBottom: "8px" }}>
                                            in
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ paddingTop: "8px", paddingBottom: "8px", display: 'flex', justifyContent: 'center' }}>Metric</div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Button disabled={unitsDisabled} variant="contained" color="primary" onClick={() => handleUnitsSelection('cm')} style={{ backgroundColor: selectedUnits === 'cm' ? "#666CFF" : "#fff", textTransform: 'lowercase', borderRadius: "5px solid grey", color: selectedUnits === 'cm' ? "#fff" : "#000", marginBottom: "8px" }}>
                                            cm
                                        </Button>
                                        <Button disabled={unitsDisabled} variant="contained" color="primary" onClick={() => handleUnitsSelection('mm')} style={{ backgroundColor: selectedUnits === 'mm' ? "#666CFF" : "#fff", textTransform: 'lowercase', borderRadius: "5px solid grey", color: selectedUnits === 'mm' ? "#fff" : "#000" }}>
                                            mm
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                        {unitsModalAgain === false ?
                            <>
                                <DialogActions style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button onClick={handleModalClose} color="primary" style={{ backgroundColor: "#666CFF", color: "#fff" }}>
                                        OK
                                    </Button>
                                </DialogActions>
                                <Typography style={{ display: 'flex', justifyContent: 'center', fontSize: '11px', color: '#85909E' }}>
                                    (Units once selected cannot be changed)
                                </Typography>
                            </> :
                            <Typography style={{ display: 'flex', justifyContent: 'center', fontSize: '12px', color: '#85909E' }}>
                                You have already selected the units and cannot select again
                            </Typography>
                        }
                    </Dialog>
                )}
                {modalContent === 'Wall setup' && (
                    <Dialog
                        open={modalOpen}
                        onClose={handleModalClose}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                        PaperProps={{
                            style: { width: '900px', maxWidth: 'none', zIndex: 9999 }, // Higher z-index for the modal
                        }}
                    >
                        <DialogTitle id="modal-title" style={{ fontWeight: "bold", display: 'flex', justifyContent: 'center' }}>WALL TYPES</DialogTitle>
                        <DialogContent>
                            <WallTableComponent/>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleModalClose} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
                {settingsOpen && (
                    <>
                        <Popover
                            open={settingsOpen}
                            anchorEl={settingsAnchorEl}
                            onClose={handleCloseSettingsClick}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            PaperProps={{
                                style: { zIndex: 9999 }, // Higher z-index for the settings popover
                            }}
                        >
                            <Box
                                sx={{
                                    right: '0',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '5px',
                                    padding: '8px',
                                    zIndex: 1,
                                    width: 400,
                                    height: 400, // Set a fixed height
                                    overflowY: 'auto' // Enable vertical scrolling
                                }}
                            >

                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div>
                                        <p>Grid</p>
                                    </div>
                                    <div>
                                        <FormGroup>
                                            <FormControlLabel control={<Switch checked={gridSwitch} onChange={handleGridSwitch} />} label="" />
                                        </FormGroup>
                                    </div>
                                </div>
                                {gridSwitch && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <TextField
                                                label="Spacing"
                                                fullWidth
                                                margin="normal"
                                                variant="outlined"
                                                value={gridScaleValue}
                                                style={{ width: '60%' }}
                                                onChange={handleGridScaleValue}
                                            />
                                            <FormControl variant="outlined" style={{ marginLeft: '8px', width: '33%', marginTop: '10px' }}>
                                                <InputLabel>Unit</InputLabel>
                                                <Select
                                                    value={gridUnit}
                                                    onChange={handleGridScaleUnitChange}
                                                    label="Unit"
                                                >
                                                    <MenuItem value="meter">METERS</MenuItem>
                                                    <MenuItem value="cm">CM</MenuItem>
                                                    <MenuItem value="mm">MM</MenuItem>
                                                    <MenuItem value="feet">FEET</MenuItem>
                                                    <MenuItem value="in">INCHES</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div>
                                            <Typography variant="h6" style={{ color: 'rgba(0, 0, 0, 0.5)', marginBottom: '1px', marginTop: '8px', fontSize: '12px' }}>Grid Transparency</Typography>
                                            <Slider
                                                size="small"
                                                defaultValue={70}
                                                aria-label="Small"
                                                valueLabelDisplay="auto"
                                                style={{ opacity: 0.8, width: '96%' }}
                                                onChange={handleGridSliderChange}
                                            />
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <div>
                                                <p>Snap To Grid</p>
                                            </div>
                                            <div>
                                                {!snapGrid ? (
                                                    <LockIcon
                                                        style={{ cursor: 'pointer', marginRight: '5px', marginTop: '15px', color: 'red' }}
                                                        onClick={() => setSnapGrid(true)}
                                                    />
                                                ) : (
                                                    <LockOpenIcon
                                                        style={{ cursor: 'pointer', marginRight: '5px', marginTop: '15px', color: 'green' }}
                                                        onClick={() => setSnapGrid(false)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <p>Grid Color</p>
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        marginRight: '5px',
                                                        backgroundColor: gridColor,
                                                        cursor: 'pointer',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '4px'
                                                    }}
                                                    onClick={handleColorPickerOpen}
                                                />
                                                {colorPickerOpen && (
                                                    <div style={{ zIndex: 999 }}>
                                                        <SketchPicker
                                                            color={gridColor}
                                                            onChangeComplete={handleColorChange}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                                <Divider style={{ marginTop: '10px' }} />
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div>
                                        <p>Upload Image</p>
                                    </div>
                                    {uploadBtn ? (
                                        <>
                                            <div style={{ marginTop: "10px" }}>
                                                <Button
                                                    variant="contained"
                                                    style={{
                                                        fontSize: "8px",
                                                        marginLeft: "49px",
                                                        marginRight: "113px",
                                                        height: "32px",
                                                        backgroundColor: uploadedImage ? 'red' : '',
                                                    }}
                                                    onClick={handleDeleteImage} // Attach the delete function here
                                                >
                                                    Delete
                                                </Button>
                                                {uploadedImageName && (
                                                    <div style={{
                                                        position: "relative",
                                                        top: "-32px",
                                                        left: "114px",
                                                        border: "1px solid red",
                                                        width: "110px",  // Fixed width for the div
                                                        height: "32px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}>
                                                        {uploadedImageName}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            style={{
                                                fontSize: "8px",
                                                height: "32px",
                                                marginLeft: "200px",
                                                marginTop: "10px",
                                                backgroundColor: uploadedImage ? 'red' : '',
                                            }}
                                            onClick={handleUploadClick}
                                        >
                                            Upload
                                        </Button>
                                    )}
                                </div>
                                {uploadBtn && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <div>
                                            <p>Image Tools</p>
                                        </div>
                                        <div>
                                            {!imageSwitchOn ? (
                                                <LockIcon
                                                    style={{ cursor: 'pointer', marginRight: '5px', marginTop: '15px', color: 'red' }}
                                                    onClick={() => setImageSwitchOn(true)}
                                                />
                                            ) : (
                                                <LockOpenIcon
                                                    style={{ cursor: 'pointer', marginRight: '5px', marginTop: '15px', color: 'green' }}
                                                    onClick={() => setImageSwitchOn(false)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                                {imageSwitchOn && (
                                    <>
                                        <div>
                                            <Typography variant="h6" style={{ color: 'rgba(0, 0, 0, 0.5)', marginBottom: '1px', marginTop: '8px', fontSize: '12px' }}>Transparency Slider</Typography>
                                            <Slider
                                                size="small"
                                                defaultValue={70}
                                                aria-label="Small"
                                                valueLabelDisplay="auto"
                                                style={{ opacity: 0.8, width: '96%' }}
                                                disabled={isImageMoved}
                                                onChange={handleSliderChange}
                                            />
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <div>Scale</div>
                                            <div>
                                                <Button variant="contained" color="primary" disabled={isImageMoved} style={{ fontSize: "8px", marginLeft: "180px" }} onClick={handleChangeScale}>
                                                    Change scale
                                                </Button>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", marginTop: "10px", justifyContent: "space-between" }}>
                                            <div>Move Image</div>
                                            <div>
                                                <Button variant="contained" color={buttonColor} disabled={!uploadedImage} onClick={handleMoveImage} style={{ fontSize: "8px", marginLeft: "142px" }}>
                                                    {isImageMoved ? 'DISABLE MOVE' : 'MOVE IMAGE'}
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Box>
                        </Popover>
                        {showCornerText && (
                            <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom style={{ zIndex: "9999", position: 'absolute', top: '35%', right: 16, left: '37%', color: 'blue', fontSize: '15px', backgroundColor: 'rgb(139, 216, 216)', borderRadius: '5px', maxWidth: '300px' }}>
                                Please specify the bottom left corner where the image is to be inserted
                            </Typography>
                        )}
                    </>
                )}
                {dummyQuestionModalOpen && (
                    <Dialog
                        open={dummyQuestionModalOpen}
                        onClose={() => setDummyQuestionModalOpen(false)}
                        aria-labelledby="dummy-question-modal-title"
                        aria-describedby="dummy-question-modal-description"
                        PaperProps={{
                            style: { zIndex: 9999 }, // Higher z-index for the modal
                        }}
                    >
                        <DialogTitle id="dummy-question-modal-title" style={{ fontWeight: "bold", display: 'flex', justifyContent: 'center' }}>Specify Dimensions</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Current Dimensions"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                value={currentDimensions}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                            <TextField
                                label="New Dimensions"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                value={newDimensions}
                                onChange={(e) => setNewDimensions(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDummyQuestionModalOpen(false)} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleScaleChange} color="primary">
                                OK
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
                <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message="Only one decimal place is allowed."
            />
            </Main>
        </Box>
    );
}
