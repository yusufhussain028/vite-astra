import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const VerticalMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOption1 = () => {
        // Handle option 1 action
        handleClose();
        console.log("Option 1 clicked");
    };

    const handleOption2 = () => {
        // Handle option 2 action
        handleClose();
        console.log("Option 2 clicked");
    };

    return (
        <div>
            <IconButton
                aria-label="vertical-menu"
                aria-controls="vertical-menu"
                aria-haspopup="true"
                onClick={handleClick}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="vertical-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleOption1}>Edit</MenuItem>
                <MenuItem onClick={handleOption2}>Delete</MenuItem>
            </Menu>
        </div>
    );
};

export default VerticalMenu;