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
import CloseIcon from '@mui/icons-material/Close';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import TableComponent from './../FluentUITable/FluentUITable.jsx';
import FloorsModal from './../FloorsModal/FloorsModal.jsx';
import DrawingTool from '../Paper/PaperFile.jsx';
import Popover from '@mui/material/Popover';
import goBack from '../../images/go-back.png';
import { useNavigate } from 'react-router-dom';

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
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalContent, setModalContent] = React.useState('');
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [transparency, setTransparency] = React.useState(70);
    const [selectedUnits, setSelectedUnits] = React.useState('');
    const [unitsModalOpenCount, setUnitsModalOpenCount] = React.useState(0);
    const [unitsModalAgain, setUnitsModalAgain] = React.useState(false);
    const [unitsDisabled, setUnitsDisabled] = React.useState(false);
    const [settingsAnchorEl, setSettingsAnchorEl] = React.useState(null);

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
        alert("enter")
        setSettingsAnchorEl(event.currentTarget);
        setSettingsOpen(!settingsOpen);
    };

    const handleCloseSettingsClick = () => {
        setSettingsOpen(false);
        setSettingsAnchorEl(null);
    };

    const handleSliderChange = (event, newValue) => {
        setTransparency(newValue);
    };

    const handleUnitsSelection = (units) => {
        setSelectedUnits(units);
    };

    const handleGoBack = () => {
        navigate('/vite-astra');
    }

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
                    <MenuIcon />
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
                                    {index === 0 ? <img src={pipeIcon} width='20' height='20' alt='pipeIcon' /> : <MailIcon />}
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
            <IconButton color="primary" onClick={handleGoBack} style={{position: "absolute", top: "1%", left: "95%"}}>
                                <img src={goBack} height='20' width='20' />
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
                {modalContent === 'Floors' ? (
                    // <FloorsModal open={modalOpen} onClose={handleModalClose} />
                    <Dialog
                        open={modalOpen}
                        onClose={handleModalClose}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                        PaperProps={{
                            style: { width: '900px', maxWidth: 'none' },
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
                ) : modalContent === 'Units' ? (
                    <Dialog
                        open={modalOpen}
                        onClose={handleModalClose}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                        PaperProps={{
                            style: { width: '400px', maxWidth: 'none' },
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
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            position: 'relative',
                            left: "35%",
                            bottom: "35%",
                            width: "50vw",
                            height: "45vh"
                        }}
                    >
                        <DrawingTool />
                    </Box>
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
                        >
                            <Box
                                sx={{
                                    right: '0',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '5px',
                                    padding: '8px',
                                    zIndex: 1,
                                }}
                            >
                                <IconButton color="primary" onClick={handleCloseSettingsClick} style={{ float: "right" }}>
                                    <CloseIcon />
                                </IconButton>
                                <div style={{ display: "flex", paddingTop: "40px" }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <p style={{ margin: 0 }}>Image</p>
                                    </div>
                                    <div style={{ marginLeft: "175px", marginTop: "-6px" }}>
                                        <FormGroup>
                                            <FormControlLabel control={<Switch />} label="" />
                                        </FormGroup>
                                    </div>
                                </div>
                                <div>
                                    <Typography variant="h6" style={{ color: 'rgba(0, 0, 0, 0.5)', marginBottom: '1px', marginTop: '8px', fontSize: '12px' }}>Transparency Slider</Typography>
                                    <Slider
                                        size="small"
                                        defaultValue={70}
                                        aria-label="Small"
                                        valueLabelDisplay="auto"
                                        style={{ opacity: 0.8 }}
                                        onChange={handleSliderChange}
                                    />
                                </div>
                                <div style={{ display: "flex" }}>
                                    <div style={{ marginTop: "8px" }}>Lock</div>
                                    <div style={{ marginLeft: "190px", float: "right" }}>
                                        <FormGroup>
                                            <FormControlLabel control={<Switch />} label="" />
                                        </FormGroup>
                                    </div>
                                </div>
                                <div style={{ display: "flex" }}>
                                    <div>Scale</div>
                                    <div>
                                        <Button variant="contained" color="primary" style={{ fontSize: "8px", marginLeft: "180px" }}>
                                            Change scale
                                        </Button>
                                    </div>
                                </div>
                                <div style={{ display: "flex", marginTop: "10px" }}>
                                    <div>Move Image</div>
                                    <div>
                                        <Button variant="contained" color="primary" style={{ fontSize: "8px", marginLeft: "142px" }}>
                                            MOVE IMAGE
                                        </Button>
                                    </div>
                                </div>
                                <div style={{ display: "flex", marginTop: "10px" }}>
                                    <div>Upload</div>
                                    <div>
                                        <Button variant="contained" color="primary" style={{ fontSize: "8px", marginLeft: "200px" }}>
                                            Upload
                                        </Button>
                                    </div>
                                </div>
                            </Box>
                        </Popover>
                        {/* <div style={{ position: "relative", maxHeight: "20px", maxWidth: "20px", marginTop: "142px", marginRight: "10px" }}>
                        <IconButton color="primary" onClick={handleSettingsClick}>
                            <SettingsIcon />
                        </IconButton>
                    </div>
                    <Box
                        
                    >
                        <IconButton color="primary" onClick={handleCloseSettingsClick} style={{ float: "right" }}>
                            <CloseIcon />
                        </IconButton>
                        <div style={{ display: "flex", paddingTop: "40px" }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <p style={{ margin: 0 }}>Image</p>
                            </div>
                            <div style={{ marginLeft: "150px", marginTop: "-6px" }}>
                                <FormGroup>
                                    <FormControlLabel control={<Switch />} label="" />
                                </FormGroup>
                            </div>
                        </div>
                        <div>
                            <Typography variant="h6" style={{ color: 'rgba(0, 0, 0, 0.5)', marginBottom: '1px', marginTop: '8px', fontSize: '12px' }}>Transparency Slider</Typography>
                            <Slider
                                size="small"
                                defaultValue={70}
                                aria-label="Small"
                                valueLabelDisplay="auto"
                                style={{ opacity: 0.8 }}
                                onChange={handleSliderChange}
                            />
                        </div>
                        <div style={{ display: "flex" }}>
                            <div style={{ marginTop: "8px" }}>Lock</div>
                            <div style={{ marginLeft: "160px", float: "right" }}>
                                <FormGroup>
                                    <FormControlLabel control={<Switch />} label="" />
                                </FormGroup>
                            </div>
                        </div>
                        <div style={{ display: "flex" }}>
                            <div>Scale</div>
                            <div>
                                <Button variant="contained" color="primary" style={{ fontSize: "8px", marginLeft: "120px" }}>
                                    Change scale
                                </Button>
                            </div>
                        </div>
                        <div style={{ display: "flex", marginTop: "10px" }}>
                            <div>Move Image</div>
                            <div>
                                <Button variant="contained" color="primary" style={{ fontSize: "8px", marginLeft: "82px" }}>
                                    MOVE IMAGE
                                </Button>
                            </div>
                        </div>
                        <div style={{ display: "flex", marginTop: "10px" }}>
                            <div>Upload</div>
                            <div>
                                <Button variant="contained" color="primary" style={{ fontSize: "8px", marginLeft: "139px" }}>
                                    Upload
                                </Button>
                            </div>
                        </div>
                    </Box> */}
                        {/* <Box
                            sx={{
                                display: 'flex',
                                position: 'relative',
                                left: "35%",
                                bottom: "35%",
                                width: "50vw",
                                height: "45vh"
                            }}
                        >
                            <DrawingTool />
                        </Box> */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            backgroundColor: `rgba(0, 0, 0, ${transparency / 100})`,
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)', // Center the box within the parent
                            display: 'flex', // Use flexbox
                            justifyContent: 'center', // Center horizontally
                            alignItems: 'center' // Center vertically
                        }}>
                            hello
                        </div>
                    </>
                )}
            </Main>
        </Box>
    );
}
