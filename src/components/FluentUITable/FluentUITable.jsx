import React, { useState } from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  PrimaryButton,
  DefaultButton,
  Modal,
  TextField,
  IconButton,
  Checkbox,
  Stack,
} from '@fluentui/react';
import DeleteIcon from '../../images/delete.png';
import { makeStyles, useId, Input, Label } from "@fluentui/react-components";
import { useBoolean } from '@fluentui/react-hooks';
import {
  FolderRegular,
  EditRegular,
  OpenRegular,
  DocumentRegular,
  PeopleRegular,
  DocumentPdfRegular,
  VideoRegular,
} from '@fluentui/react-icons';
import './fluentUITable.css';
import closeIcon from '../../images/Close.png';

// const initialItems = [
//   {
//     key: '1',
//     file: { label: 'Floor design', icon: <DocumentRegular /> },
//     author: { label: 'Max Mustermann', status: 'available' },
//     lastUpdated: { label: '7h ago', timestamp: 3 },
//     lastUpdate: { label: 'You edited this', icon: <EditRegular /> },
//   },
//   {
//     key: '2',
//     file: { label: '2nd Floor design', icon: <FolderRegular /> },
//     author: { label: 'Erika Mustermann', status: 'busy' },
//     lastUpdated: { label: 'Yesterday at 1:45 PM', timestamp: 2 },
//     lastUpdate: { label: 'You recently opened this', icon: <OpenRegular /> },
//   },
//   {
//     key: '3',
//     file: { label: 'Floor map', icon: <VideoRegular /> },
//     author: { label: 'John Hammond', status: 'away' },
//     lastUpdated: { label: 'Yesterday at 1:45 PM', timestamp: 2 },
//     lastUpdate: { label: 'You recently opened this', icon: <OpenRegular /> },
//   },
//   {
//     key: '4',
//     file: { label: 'Unheated section map', icon: <DocumentPdfRegular /> },
//     author: { label: 'Jane Doe', status: 'offline' },
//     lastUpdated: { label: 'Tue at 9:30 AM', timestamp: 1 },
//     lastUpdate: { label: 'You shared this in a Teams chat', icon: <PeopleRegular /> },
//   },
// ];

const TableComponent = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [newFileLabel, setNewFileLabel] = useState('');
  const [newFileAbbrevation, setNewFileAbbrevation] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const handleAddFile = () => {
    setItems([
      ...items,
      {
        key: (items.length + 1).toString(),
        file: { label: newFileLabel, icon: <DocumentRegular /> }, // Example with default icon
        author: { label: newFileAbbrevation, status: 'available' }, // Example with default status
        lastUpdated: { label: 'Just now', timestamp: Date.now() },
        lastUpdate: { label: 'Created new', icon: <EditRegular /> },
      },
    ]);
    setNewFileLabel('');
    setNewFileAbbrevation('');
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

  const handleDeleteSelected = () => {
    setItems(items.filter((item) => !selectedItems.some((selectedItem) => selectedItem.key === item.key)));
    setSelectedItems([]);
  };

  const columns = [
    {
      key: 'column1',
      name: 'Select',
      fieldName: 'select',
      minWidth: 50,
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
      name: 'FLOOR NAME',
      fieldName: 'Floor Name',
      minWidth: 150,
      maxWidth: 200,
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
      name: 'FLOOR ABBREVATION',
      fieldName: 'Floor Abbrevation',
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      onRender: (item) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#0078d4',
              display: 'inline-block',
              marginRight: 8,
            }}
          />
          <span style={{ marginLeft: 8 }}>{item.author.label}</span>
        </div>
      ),
    },
    {
      key: 'column4',
      name: 'LAST UPDATED',
      fieldName: 'lastUpdated',
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      onRender: (item) => <span>{item.lastUpdated.label}</span>,
    },
    {
      key: 'column6',
      name: 'Actions',
      fieldName: 'actions',
      minWidth: 100,
      maxWidth: 100,
      isResizable: true,
      onRender: (item) => (
        <img src={DeleteIcon} width='20' height='20' onClick={() => handleDelete(item.key)} style={{cursor: "pointer"}}></img>
        // <IconButton
        //   iconProps={{ iconName: 'Delete' }}
        //   title="Delete"
        //   ariaLabel="Delete"
        //   onClick={() => handleDelete(item.key)}
        //   styles={{ root: { color: '#a80000' } }}
        // />
      ),
    },
  ];

  return (
    <div>
      <Stack horizontal horizontalAlign="space-between" styles={{ root: { marginBottom: 20 } }}>
        <PrimaryButton text="+ ADD FLOORS" onClick={showModal} />
        <DefaultButton
          text="DELETE SELECTED"
          onClick={handleDeleteSelected}
          disabled={selectedItems.length === 0}
        />
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
      >
        <div className="modal-header">
          <span>Add New Floor</span>
          <img src={closeIcon} height="25" width="30" onClick={hideModal} style={{cursor: "pointer"}}></img>
          {/* <IconButton
            iconProps={{ iconName: 'Cancel' }}
            ariaLabel="Close popup modal"
            onClick={hideModal}
          /> */}
        </div>
        {/* <div className="modal-body">
          <TextField
            label="File Label"
            value={newFileLabel}
            onChange={(e, newValue) => setNewFileLabel(newValue)}
          />
          <Stack horizontal horizontalAlign="end" style={{display: "flex", marginTop: "35px", justifyContent: "space-evenly"}}>
            <DefaultButton text="Cancel" onClick={hideModal} />
            <PrimaryButton text="Add" onClick={handleAddFile} />
          </Stack>
        </div> */}
        <div className="modal-body">
          <TextField
            label="Floor Name"
            value={newFileLabel}
            onChange={(e, newValue) => setNewFileLabel(newValue)}
            styles={{ root: { width: '98%' } }} // Ensure TextField takes full width
          />
          <TextField
            label="Floor Abbrevation"
            value={newFileAbbrevation}
            onChange={(e, newValue) => setNewFileAbbrevation(newValue)}
            styles={{ root: { width: '98%' } }} // Ensure TextField takes full width
          />
          <Stack horizontal horizontalAlign="end" style={{display: "flex", marginTop: "35px", justifyContent: "space-evenly" }}>
            <DefaultButton text="Cancel" onClick={hideModal} />
            <PrimaryButton text="Add" onClick={handleAddFile} />
          </Stack>
        </div>
      </Modal>
    </div>
  );
};

export default TableComponent;
