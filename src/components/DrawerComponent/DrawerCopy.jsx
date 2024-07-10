import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ruler from '../../assets/ruler-measurement-icon.png';
import floorsIcon from '../../assets/pngegg.png';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import AdUnitsIcon from '@mui/icons-material/AdUnits';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import LayersIcon from '@mui/icons-material/Layers';
import ChatIcon from '@mui/icons-material/Chat';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import FloorsModal from './../FloorsModal/FloorsModal'; // Import the FloorsModal component

const drawerWidth = 240;

export default function ResponsiveDrawer(props) {
    const { window } = props;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalContent, setModalContent] = React.useState('');

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    const handleMenuItemClick = (text) => {
        setModalContent(text);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const drawer = (
        <div>
            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                <MenuIcon style={{ marginTop: "20px" }} onClick={handleDrawerToggle} />
            </div>
            <Divider />
            <List>
                {['Units(mm)', 'Floors', 'Manifold sizes'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton onClick={() => handleMenuItemClick(text)}>
                            <ListItemIcon>
                                {index === 0 ? <AdUnitsIcon /> : ""}
                                {index === 1 ? <img width="20" height="20" src={floorsIcon} alt="Floors Icon" /> : ""}
                                {index === 2 ? <img width="20" height="20" src={ruler} alt="Ruler Icon" /> : ""}
                            </ListItemIcon>
                            <ListItemText primary={text} />
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
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
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
        </div>
    );

    // Remove this const when copying and pasting into your project.
    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onTransitionEnd={handleDrawerTransitionEnd}
                    onClose={handleDrawerClose}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
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
                            alignItems: 'center', // Center the icons horizontally
                        }}
                    >
                        <IconButton color="primary">
                            <SettingsIcon />
                        </IconButton>
                        <IconButton color="primary">
                            <LayersIcon />
                        </IconButton>
                        <IconButton color="primary">
                            <ChatIcon />
                        </IconButton>
                    </Box>
                </Typography>
            </Box>
            {modalContent === 'Floors' ? (
                <FloorsModal open={modalOpen} onClose={handleModalClose} />
            ) : (
                <Dialog
                    open={modalOpen}
                    onClose={handleModalClose}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <DialogTitle id="modal-title">Select project {modalContent}</DialogTitle>
                    <DialogContent>
                        <Typography id="modal-description">
                            Content for {modalContent}
                        </Typography>
                        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                            <div>
                                <div style={{ paddingTop: "8px", paddingBottom: "8px" }}>Imperial</div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Button variant="contained" color="primary" style={{ backgroundColor: "#fff", borderRadius: "5px solid grey", color: "#000", marginBottom: "8px" }}>
                                        in
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <div style={{ paddingTop: "8px", paddingBottom: "8px" }}>Metric</div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Button variant="contained" color="primary" style={{ backgroundColor: "#fff", borderRadius: "5px solid grey", color: "#000", marginBottom: "8px" }}>
                                        cm
                                    </Button>
                                    <Button variant="contained" color="primary" style={{ backgroundColor: "#fff", borderRadius: "5px solid grey", color: "#000" }}>
                                        mm
                                    </Button>
                                    </div>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleModalClose} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}