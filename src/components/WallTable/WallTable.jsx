import React, { useState, useEffect } from 'react';
import {
    DetailsList,
    DetailsListLayoutMode,
    SelectionMode,
    PrimaryButton,
    DefaultButton,
    Modal,
    Checkbox,
    Stack,
} from '@fluentui/react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { SketchPicker } from 'react-color';
import { useBoolean } from '@fluentui/react-hooks';
import {
    EditRegular,
    OpenRegular,
} from '@fluentui/react-icons';
import './wallTable.css';
import closeIcon from '../../images/Close.png';

const initialItems = [
    {
        key: '1',
        file: { label: 'Invisible Patter' },
        author: { label: 'IP' },
        lastUpdated: { label: '20' },
        lastUpdate: { label: 'Blank', icon: <EditRegular /> },
        color: '#808080',
    },
    {
        key: '2',
        file: { label: 'Exterior Wall 1' },
        author: { label: 'CE1' },
        lastUpdated: { label: '25' },
        lastUpdate: { label: 'Solid', icon: <OpenRegular /> },
        color: '#00FF00',
    },
    {
        key: '3',
        file: { label: 'Interior Wall 1' },
        author: { label: 'DE1' },
        lastUpdated: { label: '15' },
        lastUpdate: { label: 'Solid', icon: <OpenRegular /> },
        color: '#FFA500',
    }
];

const WallTableComponent = ({ onUpdateWalls, wallUnit }) => {
    const [items, setItems] = useState(initialItems);
    const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
    const [newFileLabel, setNewFileLabel] = useState('');
    const [newFileAbbrevation, setNewFileAbbrevation] = useState('');
    const [thickness, setThickness] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [wallColor, setWallColor] = useState('#000000');
    const [colorPickerPosition, setColorPickerPosition] = useState({ top: 50, left: 50 });

    useEffect(() => {
        onUpdateWalls(items);
    }, [items, onUpdateWalls]);

    const handleAddFile = () => {
        setItems([
            ...items,
            {
                key: (items.length + 1).toString(),
                file: { label: newFileLabel },
                author: { label: newFileAbbrevation },
                lastUpdated: { label: `${thickness} ${wallUnit}` },
                lastUpdate: { label: 'Created new', icon: <EditRegular /> },
                color: wallColor,
            },
        ]);
        setNewFileLabel('');
        setNewFileAbbrevation('');
        setThickness('');
        hideModal();
    };

    const handleDelete = (key) => {
        setItems(items.filter((item) => item.key !== key));
    };

    const handleCheckboxChange = (key, checked) => {
        setSelectedItems((prevSelectedItems) => {
            if (checked) {
                return [...prevSelectedItems, items.find((item) => item.key === key)];
            } else {
                return prevSelectedItems.filter((item) => item.key !== key);
            }
        });
    };

    const handleGridScaleUnitChange = (event) => {
        setWallUnit(event.target.value);
    };

    const handleColorPickerOpen = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setColorPickerPosition({
            top: rect.top - 220, // Adjust this value as needed
            left: rect.left,
        });
        setColorPickerOpen(!colorPickerOpen);
    };

    const handleColorChange = (color) => {
        setWallColor(color.hex);
        setColorPickerOpen(false);
        // You might want to add additional logic to update the grid color in your canvas or other component
    };

    const handleDeleteSelected = () => {
        setItems(items.filter((item) => !selectedItems.some((selectedItem) => selectedItem.key === item.key)));
        setSelectedItems([]);
    };

    const columns = [
        {
            key: 'column1',
            name: 'Select',
            fieldName: 'select',
            minWidth: 40,
            maxWidth: 50,
            isResizable: true,
            onRender: (item) => (
                <Checkbox
                    checked={selectedItems.some((selectedItem) => selectedItem.key === item.key)}
                    onChange={(e, checked) => handleCheckboxChange(item.key, checked)}
                />
            ),
        },
        {
            key: 'column2',
            name: 'NAME',
            fieldName: 'Name',
            minWidth: 110,
            maxWidth: 210,
            isResizable: true,
            onRender: (item) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {item.file.icon}
                    <span style={{ marginLeft: 8 }}>{item.file.label}</span>
                </div>
            ),
        },
        {
            key: 'column3',
            name: 'ABBREVATION',
            fieldName: 'Abbrevation',
            minWidth: 90,
            maxWidth: 130,
            isResizable: true,
            onRender: (item) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginLeft: 8 }}>{item.author.label}</span>
                </div>
            ),
        },
        {
            key: 'column4',
            name: 'THICKNESS',
            fieldName: 'Thickness',
            minWidth: 80,
            maxWidth: 120,
            isResizable: true,
            onRender: (item) => <span>{item.lastUpdated.label}</span>,
        },
        {
            key: 'column5',
            name: 'PATTERN',
            fieldName: 'Pattern',
            minWidth: 80,
            maxWidth: 120,
            isResizable: true,
            onRender: (item) => <span>{item.lastUpdated.label}</span>,
        },
        {
            key: 'column6',
            name: 'COLOR',
            fieldName: 'Color',
            minWidth: 70,
            maxWidth: 100,
            isResizable: true,
            onRender: (item) => (
                <div style={{ width: "20px", height: "20px", borderRadius: "5px", backgroundColor: item.color }}>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Stack horizontal horizontalAlign="space-between" styles={{ root: { marginBottom: 20 } }}>
                <div style={{ color: "grey" }}>
                    Show
                </div>
                <div>
                    <DefaultButton
                        text="DELETE SELECTED"
                        onClick={handleDeleteSelected}
                        disabled={selectedItems.length === 0}
                        style={{ marginRight: "5px" }}
                    />
                    <PrimaryButton text="+ ADD WALL" onClick={showModal} />
                </div>
            </Stack>
            <DetailsList
                items={items}
                columns={columns}
                setKey="set"
                layoutMode={DetailsListLayoutMode.fixedColumns}
                selectionMode={SelectionMode.none}
            />
            <Modal
                isOpen={isModalOpen}
                onDismiss={hideModal}
                isBlocking={false}
                containerClassName="modal-container"
                styles={{ main: { overflow: 'hidden' } }} // Prevent overflow for the modal
            >
                <div className="modal-header">
                    <span>Add New Wall</span>
                    <img src={closeIcon} height="25" width="30" onClick={hideModal} style={{ cursor: "pointer" }} alt="Close icon" />
                </div>
                <div className="modal-body" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', position: 'relative' }}>
                    <div>
                        <TextField
                            label="Wall Name"
                            value={newFileLabel}
                            onChange={(e) => setNewFileLabel(e.target.value)}
                            fullWidth
                            margin="dense"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                style: {
                                    height: '10px',
                                },
                            }}
                        />
                    </div>
                    <div>
                        <TextField
                            label="Abbrevation*"
                            value={newFileAbbrevation}
                            onChange={(e) => setNewFileAbbrevation(e.target.value)}
                            fullWidth
                            margin="dense"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                style: {
                                    height: '10px',
                                },
                            }}
                        />
                    </div>
                    <div>
                        <TextField
                            label="Thickness*"
                            value={thickness}
                            onChange={(e) => setThickness(e.target.value)}
                            fullWidth
                            margin="dense"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">{wallUnit}</InputAdornment>,
                            }}
                            inputProps={{
                                style: {
                                    height: '10px',
                                },
                            }}
                        />
                    </div>
                    <div>
                        <TextField
                            label="Pattern*"
                            value={thickness}
                            onChange={(e) => setThickness(e.target.value)}
                            fullWidth
                            margin="dense"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                style: {
                                    height: '10px',
                                },
                            }}
                        />
                    </div>
                    <div style={{ zIndex: '999', marginTop: '9px' }}>
                        <select
                            id="simple-dropdown"
                            value={wallUnit}
                            onChange={handleGridScaleUnitChange}
                            style={{ padding: '5px', fontSize: '14px', outline: 'none', border: '1px solid #D9D9D9', color: '#666666', borderRadius: '5px', width: '100%', height: '45px' }}
                        >
                            <option value="">Units*</option>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', border: '1px solid #D9D9D9', borderRadius: '5px', width: '100%', height: '46px' }}>
                        <div style={{ paddingLeft: '5px' }}>
                            <p>Wall Color</p>
                        </div>
                        <div>
                            <div
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    marginRight: '5px',
                                    backgroundColor: wallColor,
                                    cursor: 'pointer',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                }}
                                onClick={handleColorPickerOpen}
                            />
                            {colorPickerOpen && (
                                <div style={{ position: 'fixed', zIndex: 1000, top: colorPickerPosition.top, left: colorPickerPosition.left }}>
                                    <SketchPicker
                                        color={wallColor}
                                        onChangeComplete={handleColorChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <Stack horizontal horizontalAlign="end" style={{ display: "flex", marginTop: "25px", justifyContent: "space-evenly" }}>
                        <DefaultButton text="Cancel" onClick={hideModal} />
                        <PrimaryButton text="Add" onClick={handleAddFile} />
                    </Stack>
                </div>
            </Modal>
        </div>
    );
};

export default WallTableComponent;
