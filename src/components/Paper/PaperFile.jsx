import React, { useEffect, useRef, useState } from 'react';
import paper, { Raster, PointText, Layer, Point, Path, Shape } from 'paper';
import tinycolor from 'tinycolor2';
import ThicknessIcon from '../../images/thickness-icon.png';
import ColorPickerIcon from '../../images/color-picker.png';
import wallDataIcon from '../../images/wall_data.png';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { SketchPicker } from 'react-color';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import './paperFile.css';

const DrawingTool = ({
    transparency, canvasStyle, uploadImage, newScale, onDistanceMeasured, toolEnabled, lockedImage, selectedUnit, drawWalls, gridTransparency, gridLineColor, gridScaleVal, walls
}) => {
    const canvasRef = useRef(null);
    const textLayerRef = useRef(null);
    const gridLayerRef = useRef(null);
    const rasterLayerRef = useRef(null);
    const shapesLayerRef = useRef(null);
    const rasterRef = useRef(null);
    const [checkImg, setCheckImg] = useState(false);
    const [distanceText, setDistanceText] = useState('');
    const [widthText, setWidthText] = useState('');
    const [heightText, setHeightText] = useState('');
    const [imagePosition, setImagePosition] = useState(null);
    const [instructionText, setInstructionText] = useState('');
    const [moveInstruction, setMoveInstruction] = useState('');
    const [measurementComplete, setMeasurementComplete] = useState(false);
    const [rasterPosition, setRasterPosition] = useState(null);
    const [lockImageFunctFire, setLockImageFuncFire] = useState(true);
    const [lineThicknessDim, setLineThicknessDim] = useState();
    const [lineThicknessModal, setLineThicknessModal] = useState(false);
    const [thicknessValue, setThicknessValue] = useState(5); // Default thickness value
    const [colorModal, setColorModal] = useState(false);
    const [gridColor, setGridColor] = useState('#000000');
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [colorPickerPosition, setColorPickerPosition] = useState({ top: 50, left: 50 });
    const [wallData, setWallData] = useState([]); // State to store wall data
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false); // State to control the schedule modal
    const [drawnRectangles, setDrawnRectangles] = useState([]); // State to store drawn rectangles
    const [selectedValue, setSelectedValue] = useState(''); // State for dropdown
    const [selectedWall, setSelectedWall] = useState([]);
    const [roomNumber, setRoomNumber] = useState(1); // Initial room number


    let isDragging = false;
    let dragStart = null;
    let isRightMouseDown = false;
    let rightMouseStart = null;

    const MIN_ZOOM = 0.8; // Define a minimum zoom level
    const CANVAS_WIDTH_IN_METERS = 228; // Width of the canvas in meters
    const CANVAS_HEIGHT_IN_METERS = 100; // Height of the canvas in meters

    // Function to get scale factor based on the selected unit
    const getScaleFactor = (unit) => {
        switch (unit) {
            case 'in':
                return 40; // Convert meters to inches (1 meter = 39.3701 inches)
            case 'cm':
                return 100; // Convert meters to centimeters (1 meter = 100 cm)
            case 'mm':
                return 1000; // Convert meters to millimeters (1 meter = 1000 mm)
            case 'feet':
                return 3; // Convert meters to feet (1 meter = 3.2 feet)
            case 'meter':
                return 1; // Convert meters to feet (1 meter = 3.2 feet)
            default:
                return 1; // Default scale factor for meters
        }
    };

    const SCALE_FACTOR = getScaleFactor(selectedUnit); // Scaling factor based on selected unit

    useEffect(() => {
        const loadImage = async (position) => {
            if (!uploadImage || !position) return;
            const img = new Image();
            img.onload = () => {
                if (rasterRef.current) {
                    rasterRef.current.remove(); // Remove existing raster before loading new one
                }

                const raster = new Raster(img);
                rasterRef.current = raster; // Store the new raster in the ref
                rasterLayerRef.current.addChild(raster);
                const scale = newScale ? newScale : 1;
                raster.position = rasterPosition ? rasterPosition : new Point(position.x + (raster.width * scale) / 2, position.y - (raster.height * scale) / 2);
                raster.scale(scale);
                raster.opacity = transparency / 100;
                raster.sendToBack();
                setCheckImg(true);
                if (toolEnabled) {
                    setInstructionText('Click start point of the dimension”');
                }
            };
            img.src = uploadImage;
        };

        paper.setup(canvasRef.current);

        if (uploadImage && imagePosition) {
            loadImage(imagePosition);
        }

        let point1 = null;
        let point2 = null;

        const tool = new paper.Tool();
        const moveTool = new paper.Tool();

        function updateImageLockStatus() {
            if (lockedImage) {
                if (lockImageFunctFire) {
                    applyHighlightEffect(rasterRef.current);
                    setMoveInstruction('Select reference point for the move');
                    setTimeout(() => setMoveInstruction(''), 2000)
                    moveTool.activate();
                }
                else {
                    removeHighlightEffect(rasterRef.current);
                    console.log('test move');
                }
            } else {
                removeHighlightEffect(rasterRef.current);
                console.log('test move');
            }
        }

        let firstPoint = null; // Store the first point
        let secondPoint = null; // Store the second point
        let tempLine = null; // Temporary line for visualization
        let movePointMarkers = []; // Store the markers
        let permanentLines = []; // store permanent lines

        moveTool.onMouseDown = function (event) {
            if (!firstPoint) {
                // Set the first point
                firstPoint = event.point;
                drawMovePointMarker(firstPoint);
                setMoveInstruction('Now select the location point');
            } else {
                // Set the second point and finalize the line
                secondPoint = event.point;
                drawMovePointMarker(secondPoint);
                drawPermanentLine(firstPoint, secondPoint);
                moveImageByVector(firstPoint, secondPoint); // Move the image
                updateRectanglePosition();
                disableMoveToolAndRemoveElements();
                // Reset points to allow for a new line to be drawn
                firstPoint = null;
                secondPoint = null;
                setMoveInstruction('Image moved successfully');
                setLockImageFuncFire(false);
                setTimeout(() => setLockImageFuncFire(true), 2000);
                setTimeout(() => setMoveInstruction(''), 2000);
                if (tempLine) {
                    tempLine.remove(); // Remove temporary line when done
                    tempLine = null;
                }
            }
        };

        moveTool.onMouseMove = function (event) {
            if (firstPoint && !secondPoint) {
                // Update the temporary line as the mouse moves
                if (tempLine) {
                    tempLine.remove(); // Remove old temporary line
                }
                tempLine = new paper.Path.Line({
                    from: firstPoint,
                    to: event.point,
                    strokeColor: 'red',
                    strokeWidth: 2,
                    dashArray: [4, 2], // Optional: Makes the line dashed
                });
            }
        };

        function moveImageByVector(from, to) {
            const vector = to.subtract(from);
            if (rasterRef.current) {
                rasterRef.current.position = rasterRef.current.position.add(vector);
                setMoveInstruction('Image moved successfully');
                disableMoveToolAndRemoveElements();
                setRasterPosition(rasterRef.current.position);
                updateRectanglePosition();
            }
        }

        function drawPermanentLine(from, to) {
            // Draws a permanent line from point 'from' to point 'to'
            const line = new paper.Path.Line({
                from,
                to,
                strokeColor: 'black',
                strokeWidth: 2,
            });
            permanentLines.push(line); // Store the permanent line
        }

        function drawMovePointMarker(point) {
            // Draws a circle at the given point
            const marker = new paper.Path.Circle({
                center: point,
                radius: 5, // Set the radius of the circle
                fillColor: 'blue', // Fill color of the circle
                strokeColor: 'black', // Border color of the circle
                strokeWidth: 1,
            });
            movePointMarkers.push(marker); // Store the marker
        }

        function disableMoveToolAndRemoveElements() {
            // Disable the moveTool
            moveTool.remove();

            // Remove all markers
            movePointMarkers.forEach((marker) => marker.remove());
            movePointMarkers = [];

            // Remove all permanent lines
            permanentLines.forEach((line) => line.remove());
            permanentLines = [];

            // Remove the temporary line if it exists
            if (tempLine) {
                tempLine.remove();
                tempLine = null;
            }

            if (highlightRect) {
                highlightRect.remove(); // Remove the outline rectangle
                highlightRect = null;
            }
        }

        tool.onMouseDown = (event) => {
            if (event.event.button === 2) {
                // Right-click
                isRightMouseDown = true;
                rightMouseStart = event.point;
            } else {
                if (lockedImage && checkImg) {
                    isDragging = true;
                    dragStart = event.point;
                    applyHighlightEffect(rasterRef.current);
                } else {
                    if (!toolEnabled) return; // Disable tool if toolEnabled is false

                    if (!checkImg) {
                        setImagePosition(event.point);
                    } else {
                        if (!point1) {
                            point1 = event.point;
                            drawPointMarker(point1);
                            setInstructionText('Now, Click the second point of the dimension”');
                        } else if (!point2) {
                            point2 = event.point;
                            drawPointMarker(point2);
                            const distance = calculateDistance(point1, point2);
                            setDistanceText(`Distance: ${distance.toFixed(2)} ${selectedUnit}`);
                            drawDistanceLine(point1, point2);
                            drawDistanceText(point1, point2, distance);
                            point1 = null;
                            point2 = null;
                            setInstructionText('');
                            setMeasurementComplete(true);

                            // Trigger the callback with the distance value
                            onDistanceMeasured(distance.toFixed(2));
                        }
                    }
                }
            }
        };

        tool.onMouseDrag = (event) => {
            if (isRightMouseDown) {
                // Handle panning with right-click
                const dragDelta = event.point.subtract(rightMouseStart);
                paper.view.center = paper.view.center.subtract(dragDelta);
                rightMouseStart = event.point;
            } else if (lockedImage && isDragging && rasterRef.current) {
                const dragDelta = event.point.subtract(dragStart);
                rasterRef.current.position = rasterRef.current.position.add(dragDelta);
                dragStart = event.point; // Update dragStart to the current point
                updateRectanglePosition();
            }
        };

        tool.onMouseUp = (event) => {
            if (isRightMouseDown) {
                isRightMouseDown = false;
                rightMouseStart = null;
            } else if (lockedImage && isDragging) {
                isDragging = false;
                dragStart = null;
                setRasterPosition(rasterRef.current.position); // Store the new position
                if (!lockedImage) {
                    removeHighlightEffect(rasterRef.current);
                }
            }
        };

        tool.onKeyDown = (event) => {
            if (!toolEnabled) return; // Disable tool if toolEnabled is false

            switch (event.key) {
                case '1':
                    if (point1 && point2) {
                        drawDistanceLine(point1, point2, 5);
                    }
                    break;
                case '2':
                    if (point1 && point2) {
                        drawDistanceLine(point1, point2, 10);
                    }
                    break;
                case '3':
                    if (point1 && point2) {
                        drawDistanceLine(point1, point2, 15);
                    }
                    break;
                case 'space':
                    clearDistanceLine();
                    clearDistanceText();
                    clearPointMarkers();
                    point1 = null;
                    point2 = null;
                    setDistanceText('');
                    setInstructionText('');
                    setMeasurementComplete(false);
                    break;
                default:
                    break;
            }
        };

        function applyHighlightEffect(raster) {
            raster.shadowColor = new paper.Color(0, 0, 0); // Black shadow
            raster.shadowBlur = 20; // Blur radius
            raster.shadowOffset = new paper.Point(5, 5); // Offset shadow to the right bottom
            if (!highlightRect) {
                highlightRect = new paper.Path.Rectangle(raster.bounds);
                highlightRect.strokeColor = 'red';
                highlightRect.strokeWidth = 3;
                highlightRect.dashArray = [10, 4];
            }
        }

        function removeHighlightEffect(raster) {
            if (lockedImage) {
                raster.shadowColor = null; // Remove shadow
                raster.shadowBlur = 0;
                raster.shadowOffset = new paper.Point(0, 0);
            }
            if (highlightRect) {
                highlightRect.remove(); // Remove the outline rectangle
                highlightRect = null;
            }
        }

        function updateRectanglePosition() {
            if (highlightRect && rasterRef.current) {
                highlightRect.position = rasterRef.current.position;
            }
        }

        let highlightRect = null;
        updateImageLockStatus();

        const calculateDistance = (p1, p2) => {
            const distanceInPixels = p1.getDistance(p2);
            const zoomFactor = paper.view.zoom;
            return (distanceInPixels / (5.6 / SCALE_FACTOR)) / zoomFactor; // Convert pixels to selected unit, adjusted by zoom factor
        };

        const drawDistanceLine = (p1, p2, strokeWidth = 1) => {
            const distanceLine = new Path.Line(p1, p2);
            distanceLine.strokeColor = 'red';
            distanceLine.strokeWidth = strokeWidth;
            distanceLine.name = 'distanceLine';
        };

        const drawDistanceText = (p1, p2, distance) => {
            const midpoint = new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
            const text = new PointText({
                point: midpoint,
                content: `${distance} ${selectedUnit}`,
                fillColor: 'black',
                fontSize: 12,
            });
            textLayerRef.current.addChild(text);
        };

        const drawPointMarker = (point) => {
            const marker = new Shape.Circle({
                center: point,
                radius: 5,
                fillColor: 'blue',
                name: 'pointMarker',
            });
            textLayerRef.current.addChild(marker);
        };

        const clearDistanceLine = () => {
            const distanceLines = paper.project.activeLayer.children.filter(
                (child) => child.name === 'distanceLine',
            );
            distanceLines.forEach((line) => line.remove());
        };

        const clearDistanceText = () => {
            textLayerRef.current.removeChildren();
        };

        const clearPointMarkers = () => {
            const pointMarkers = textLayerRef.current.children.filter(
                (child) => child.name === 'pointMarker',
            );
            pointMarkers.forEach((marker) => marker.remove());
        };

        const hexToRgbaString = (hex, alpha) => {
            const color = tinycolor(hex);
            const rgba = color.toRgb();
            return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha})`;
        };

        const drawGrid = () => {
            const gridLayer = gridLayerRef.current;
            gridLayer.removeChildren();
            const bounds = paper.view.bounds;

            // Determine the spacing based on the selected unit
            if (gridScaleVal <= 0) {
                return;
            }

            let spacing;
            switch (selectedUnit) {
                case 'in':
                    spacing = (5.6 * gridScaleVal) / SCALE_FACTOR; // 1 inch = 2.54 cm
                    break;
                case 'cm':
                    spacing = (5.6 * gridScaleVal) / SCALE_FACTOR; // 1 cm = 10 pixels
                    break;
                case 'mm':
                    spacing = (5.6 * gridScaleVal) / SCALE_FACTOR; // 1 mm = 1 pixel
                    break;
                case 'feet':
                    spacing = (5.6 * gridScaleVal) / SCALE_FACTOR; // 3.2 feet = 1 meter
                    break;
                case 'meter':
                    spacing = (5.6 * gridScaleVal); // 1 meter = 5.6 pixels
                    break;
                default:
                    spacing = 5.6; // 1 meter as default
            }

            const gridTransparencyVal = gridTransparency / 100; // Assuming gridTransparencyValue is a percentage (0-100)
            const gridColorRgba = hexToRgbaString(gridLineColor, gridTransparencyVal);

            // Define a function to determine if a position is the closest to the center
            const isClosestToCenter = (pos, center, spacing) => {
                return Math.abs(pos - center) < spacing / 2;
            };

            // Center of the view
            const centerX = paper.view.center.x;
            const centerY = paper.view.center.y;

            // Draw vertical grid lines
            for (let x = bounds.left; x <= bounds.right; x += spacing) {
                const start = new Point(x, bounds.top);
                const end = new Point(x, bounds.bottom);
                const line = new Path.Line(start, end);
                line.strokeColor = isClosestToCenter(x, centerX, spacing) ? 'red' : new paper.Color(gridColorRgba);
                line.strokeWidth = isClosestToCenter(x, centerX, spacing) ? 1 / paper.view.zoom : 0.5 / paper.view.zoom;
                gridLayer.addChild(line);
            }

            // Draw horizontal grid lines
            for (let y = bounds.top; y <= bounds.bottom; y += spacing) {
                const start = new Point(bounds.left, y);
                const end = new Point(bounds.right, y);
                const line = new Path.Line(start, end);
                line.strokeColor = isClosestToCenter(y, centerY, spacing) ? 'red' : new paper.Color(gridColorRgba);
                line.strokeWidth = isClosestToCenter(y, centerY, spacing) ? 1 / paper.view.zoom : 0.5 / paper.view.zoom;
                gridLayer.addChild(line);
            }

            gridLayer.bringToFront();
        };

        const updateCanvasSizeText = () => {
            const textLayer = textLayerRef.current;
            textLayer.removeChildren();

            const widthInUnits = (CANVAS_WIDTH_IN_METERS * SCALE_FACTOR).toFixed(2);
            const heightInUnits = (CANVAS_HEIGHT_IN_METERS * SCALE_FACTOR).toFixed(2);

            const widthText = new PointText({
                point: new Point(10, 50),
                content: `Width: ${widthInUnits} ${selectedUnit}`,
                fillColor: 'black',
                fontSize: 12,
            });

            const heightText = new PointText({
                point: new Point(10, 70),
                content: `Height: ${heightInUnits} ${selectedUnit}`,
                fillColor: 'black',
                fontSize: 12,
            });

            textLayer.addChild(widthText);
            textLayer.addChild(heightText);

            setWidthText(widthText);
            setHeightText(heightText);
        };

        const positionCanvasSizeText = () => {
            if (widthText) {
                widthText.point = paper.view.bounds.topLeft.add(new Point(10, 50));
            }
            if (heightText) {
                heightText.point = paper.view.bounds.topLeft.add(new Point(10, 70));
            }
        };

        const textLayer = new Layer();
        textLayerRef.current = textLayer;

        const gridLayer = new Layer();
        gridLayerRef.current = gridLayer;

        const rasterLayer = new Layer();
        rasterLayerRef.current = rasterLayer;

        const shapesLayer = new Layer();
        shapesLayerRef.current = shapesLayer;

        updateCanvasSizeText();
        drawGrid();

        paper.view.on('frame', positionCanvasSizeText); // Update text position on each frame

        const handleScroll = (event) => {
            event.preventDefault();
            const delta = event.deltaY > 0 ? 0.9 : 1.1;

            let newZoom = paper.view.zoom * delta;
            newZoom = Math.max(newZoom, MIN_ZOOM);
            paper.view.zoom = newZoom;

            drawGrid();
            gridLayer.bringToFront(); // Ensure grid layer is always on top after zooming
        };

        window.addEventListener('wheel', handleScroll, { passive: false });

        updateCanvasSizeText();

        // Prevent the default context menu from appearing on right-click
        const preventContextMenu = (event) => {
            event.preventDefault();
        };

        window.addEventListener('contextmenu', preventContextMenu);

        return () => {
            if (canvasRef.current) {
                paper.remove();
            }
            window.removeEventListener('wheel', handleScroll);
            window.removeEventListener('contextmenu', preventContextMenu);
        };
    }, [checkImg, transparency, gridTransparency, uploadImage, newScale, imagePosition, toolEnabled, lockedImage, rasterPosition, selectedUnit, drawWalls, gridLineColor, gridScaleVal]); // Remove thicknessValue from dependencies

    useEffect(() => {
        if (toolEnabled && checkImg) {
            setInstructionText('Click start point of the dimension”');
            setMeasurementComplete(false);
        } else {
            setInstructionText('');
        }
    }, [toolEnabled, checkImg]);

    useEffect(() => {
        const canvasElement = document.querySelector('canvas');
        // Reset the instruction text based on the lockedImage prop
        if (lockedImage) {
            console.log('set the lock message');
            if (canvasElement) {
                canvasElement.style.cursor = 'pointer';
            }
        } else if (checkImg) {
            setInstructionText('Click start point of the dimension”');
            if (canvasElement) {
                canvasElement.style.cursor = 'default';
            }
        }
    }, [lockedImage, checkImg]);

    const handleWallThickness = () => {
        setLineThicknessModal(true);
    }

    const handleWallThicknessSelection = (units) => {
        setThicknessValue(units);
    };

    const handleWallColor = () => {
        setColorModal(true);
    }

    const handleColorChange = (color) => {
        setGridColor(color.hex);
        setColorPickerOpen(!colorPickerOpen);
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

    useEffect(() => {
        const wallTool = new paper.Tool();

        let startPoint = null;
        let tempRectangle = null;
        let polygonPoints = [];
        let wallColors = [];
        const SNAP_THRESHOLD = 10;
        const rectangles = [];
        const roomLabelFields = [];

        const addWallData = (area, colors, roomLabel, roomNumber, id) => {
            const newWallData = {
                id,
                area: `${area.toFixed(2)} ${selectedUnit}²`,
                colors: colors ? [...colors] : [],
                roomLabel: roomLabel,
                referenceNumber: roomNumber,
            };
            setWallData((prevData) => {
                const index = prevData.findIndex((data) => data.id === id);
                if (index !== -1) {
                    const updatedData = [...prevData];
                    updatedData[index] = newWallData;
                    return updatedData;
                } else {
                    return [...prevData, newWallData];
                }
            });
        };

        const resetAndActivateWallTool = () => {
            startPoint = null;
            tempRectangle = null;
            wallTool.activate();
        };

        const getScaleFactorWall = (unit) => {
            switch (unit) {
                case 'in':
                    return 0.14;
                case 'feet':
                    return 0.16;
                case 'meter':
                    return 0.0055;
                default:
                    return 1;
            }
        };

        const SCALE_FACTOR_Wall = getScaleFactorWall(selectedUnit);

        const createRectangleFromPoints = (start, end, thickness) => {
            const actualThickness = thickness * SCALE_FACTOR_Wall;

            const vector = end.subtract(start);
            const unitVector = vector.normalize();
            const perpendicularVector = new Point(
                (-unitVector.y * actualThickness) / 2,
                (unitVector.x * actualThickness) / 2,
            );

            const topLeft = start.add(perpendicularVector);
            const bottomLeft = start.subtract(perpendicularVector);
            const topRight = end.add(perpendicularVector);
            const bottomRight = end.subtract(perpendicularVector);

            const rectangle = new Path({
                segments: [topLeft, topRight, bottomRight, bottomLeft],
                closed: true,
                strokeColor: 'black',
                fillColor: selectedWall.color ? selectedWall.color : "blue",
                strokeWidth: 0.05,
                fullySelected: false,
            });

            const dashedLine = drawDashedLine(start, end);

            return { rectangle, dashedLine };
        };

        const createJoinedRectangle = (start, end, thickness) => {
            const actualThickness = thickness * SCALE_FACTOR_Wall;

            const vector = end.subtract(start);
            const unitVector = vector.normalize();
            const perpendicularVector = new Point(
                (-unitVector.y * actualThickness) / 2,
                (unitVector.x * actualThickness) / 2,
            );

            const topLeft = start.add(perpendicularVector);
            const bottomLeft = start.subtract(perpendicularVector);
            const topRight = end.add(perpendicularVector);
            const bottomRight = end.subtract(perpendicularVector);

            const rectangle = new Path({
                segments: [topLeft, topRight, bottomRight, bottomLeft],
                closed: true,
                strokeColor: 'black',
                fillColor: selectedWall.color ? selectedWall.color : "blue",
                strokeWidth: 0.05,
                fullySelected: false,
            });

            const dashedLine = drawDashedLine(start, end);

            return { rectangle, dashedLine };
        };

        const drawDashedLine = (start, end) => {
            const dashedLine = new Path.Line({
                from: start,
                to: end,
                strokeColor: 'black',
                dashArray: [1, 1],
                strokeWidth: 0.04
            });
            return dashedLine;
        };

        const findSnapPoint = (point) => {
            for (let i = 0; i < rectangles.length; i++) {
                const rect = rectangles[i].rectangle;
                const endPoint = rect.segments[1].point;
                if (point.getDistance(endPoint) <= SNAP_THRESHOLD) {
                    return endPoint;
                }
            }
            return point;
        };

        const adjustForSnap = (rectangles, point, threshold) => {
            for (let i = 0; i < rectangles.length; i++) {
                const rect = rectangles[i].rectangle;
                for (let j = 0; j < rect.segments.length; j++) {
                    const segmentPoint = rect.segments[j].point;
                    if (point.getDistance(segmentPoint) <= threshold) {
                        return segmentPoint;
                    }
                }
            }
            return point;
        };

        const drawTempRectangle = (endPoint, thickness) => {
            let result;
            if (rectangles.length > 0) {
                const previousRect = rectangles[rectangles.length - 1].rectangle;
                result = createJoinedRectangle(previousRect.segments[1].point, endPoint, thickness);
            } else {
                result = createRectangleFromPoints(startPoint, endPoint, thickness);
            }
            return result;
        };

        const calculateDistance = (start, end) => {
            const distanceInPixels = start.getDistance(end);
            return distanceInPixels / (5.6 / SCALE_FACTOR);
        };

        const calculateArea = (points) => {
            let area = 0;
            for (let i = 0; i < points.length; i++) {
                const j = (i + 1) % points.length;
                area += points[i].x * points[j].y;
                area -= points[j].x * points[i].y;
            }
            area = Math.abs(area) / 2;
            return area;
        };

        const drawDimensionText = (start, end) => {
            const midpoint = new Point((start.x + end.x) / 2, (start.y + end.y) / 2);
            const offset = 15;
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const isVertical = Math.abs(angle) > Math.PI / 4 && Math.abs(angle) < (3 * Math.PI) / 4;

            const adjustedPoint = isVertical
                ? new Point(midpoint.x + offset, midpoint.y)
                : new Point(midpoint.x, midpoint.y - offset);

            const distance = calculateDistance(start, end).toFixed(2);
            const unit = selectedUnit;
            const text = new PointText({
                point: adjustedPoint,
                content: `${distance} ${unit}`,
                fillColor: 'black',
                fontSize: 12,
            });
            textLayerRef.current.addChild(text);
        };

        const drawRoomLabelForm = (points, id, roomNumber) => {
            const center = points.reduce((sum, point) => sum.add(point), new Point(0, 0)).divide(points.length);

            // Create a container div for the label
            const labelContainer = document.createElement('div');
            labelContainer.style.width = 'auto';
            labelContainer.style.height = 'auto';
            labelContainer.style.position = 'absolute';
            labelContainer.style.left = `${center.x}px`;
            labelContainer.style.top = `${center.y}px`;
            labelContainer.style.transform = 'translate(-50%, -50%)';
            labelContainer.style.zIndex = '1000';
            labelContainer.style.backgroundColor = 'white';
            labelContainer.style.padding = '10px';
            labelContainer.style.border = '1px solid #ccc';
            labelContainer.style.borderRadius = '5px';
            labelContainer.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
            labelContainer.style.cursor = 'pointer'; // Make the container clickable

            // Create the label content with the room number
            const roomLabel = document.createElement('div');
            roomLabel.style.cursor = 'pointer';
            roomLabel.style.fontSize = '14px';
            roomLabel.style.fontWeight = 'bold';
            roomLabel.style.textAlign = 'center';
            roomLabel.innerHTML = `FF - 0${roomNumber}<br>Room - ${roomNumber}`;
            labelContainer.appendChild(roomLabel);

            // Append the label container to the body
            document.body.appendChild(labelContainer);

            // Store the label container reference
            roomLabelFields.push({ id, labelContainer });

            // Add click event listener to the label container
            labelContainer.addEventListener('click', () => {
                showModal(id, labelContainer, roomNumber);
            });

            return labelContainer;
        };

        const showModal = (id, labelContainer, roomNumber) => {
            // Create the modal elements
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.zIndex = '1050'; // typical z-index for modals in Material-UI
            modal.style.backgroundColor = '#fff';
            modal.style.padding = '24px';
            modal.style.width = '30%'; // set a percentage width similar to Material-UI
            modal.style.maxWidth = '500px'; // max width for responsiveness
            modal.style.borderRadius = '4px'; // smooth corner radius
            modal.style.boxShadow = '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)'; // Material-UI shadow
            modal.style.border = 'none';
            modal.style.outline = '0';

            // Create the label and input elements with Material-UI-like styling
            const createInputLabel = (text) => {
                const label = document.createElement('label');
                label.textContent = text;
                label.style.display = 'block';
                label.style.marginBottom = '8px';
                label.style.color = 'rgba(0, 0, 0, 0.54)'; // typical label color in Material-UI
                label.style.fontSize = '0.875rem';
                label.style.fontWeight = '400';
                label.style.lineHeight = '1.43';
                label.style.letterSpacing = '0.01071em';
                return label;
            };

            const refLabel = createInputLabel('Reference No:');
            const roomLabel = createInputLabel('Room Name:');

            const createInput = (defaultValue) => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = defaultValue;
                input.style.width = '100%';
                input.style.padding = '10px';
                input.style.marginBottom = '16px';
                input.style.borderRadius = '4px';
                input.style.border = '1px solid rgba(0, 0, 0, 0.23)';
                input.style.fontSize = '0.875rem';
                input.style.outline = 'none';
                input.style.boxSizing = 'border-box'; // ensure padding doesn't affect width
                input.addEventListener('focus', () => {
                    input.style.border = '2px solid #3f51b5'; // Material-UI primary color focus
                });
                input.addEventListener('blur', () => {
                    input.style.border = '1px solid rgba(0, 0, 0, 0.23)';
                });
                return input;
            };

            const refInput = createInput(`FF - 0${roomNumber}`);
            const labelInput = createInput(`Room - ${roomNumber}`);

            // Create buttons with Material-UI-like styling
            const createButton = (text) => {
                const button = document.createElement('button');
                button.innerText = text;
                button.style.width = '100%';
                button.style.padding = '10px';
                button.style.marginTop = '8px';
                button.style.border = 'none';
                button.style.color = '#fff';
                button.style.backgroundColor = '#3f51b5'; // Material-UI primary color
                button.style.cursor = 'pointer';
                button.style.fontSize = '0.875rem';
                button.style.fontWeight = '500';
                button.style.letterSpacing = '0.02857em';
                button.style.textTransform = 'uppercase';
                button.style.borderRadius = '4px';
                button.addEventListener('mouseenter', () => {
                    button.style.backgroundColor = '#303f9f'; // darken on hover
                });
                button.addEventListener('mouseleave', () => {
                    button.style.backgroundColor = '#3f51b5';
                });
                return button;
            };

            const saveButton = createButton('Update');
            saveButton.addEventListener('click', () => {
                labelContainer.innerHTML = `${refInput.value}<br>${labelInput.value}`;
                updateWallData(id, labelInput.value, refInput.value.split('-')[1].trim());
                document.body.removeChild(modal);
            });

            const closeButton = createButton('Close');
            closeButton.style.backgroundColor = '#f44336'; // red color for close
            closeButton.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            // Append all elements to the modal
            modal.appendChild(refLabel);
            modal.appendChild(refInput);
            modal.appendChild(roomLabel);
            modal.appendChild(labelInput);
            modal.appendChild(saveButton);
            modal.appendChild(closeButton);

            // Append the modal to the body
            document.body.appendChild(modal);
        };

        const updateWallData = (id, newRoomLabel, newRoomNumber) => {
            setWallData((prevData) => {
                return prevData.map(data => {
                    if (data.id === id) {
                        return {
                            ...data,
                            roomLabel: newRoomLabel,
                            referenceNumber: `FF - ${newRoomNumber}`
                        };
                    }
                    return data;
                });
            });
        };

        const removeRoomLabel = (labelField) => {
            if (labelField) {
                document.body.removeChild(labelField.textField);
            }
        };

        const drawDiagonalLine = (prevEnd, currStart, thickness) => {
            const actualThickness = thickness * SCALE_FACTOR_Wall;

            // Calculate perpendicular vector for offset
            const directionVector = currStart.subtract(prevEnd).normalize();
            const perpendicularVector = new Point(
                (-directionVector.y * actualThickness) / 2,
                (directionVector.x * actualThickness) / 2
            );

            const startCorner = prevEnd.add(perpendicularVector);
            const endCorner = currStart.subtract(perpendicularVector);

            const diagonalLine = new Path.Line({
                from: startCorner,
                to: endCorner,
                strokeColor: 'red',
                strokeWidth: 0.05,
            });

            shapesLayerRef.current.addChild(diagonalLine);
        };

        const getIntersectionPoint = (line1Start, line1End, line2Start, line2End) => {
            const denominator = ((line2End.y - line2Start.y) * (line1End.x - line1Start.x)) - ((line2End.x - line2Start.x) * (line1End.y - line1Start.y));

            if (denominator === 0) return null; // Lines are parallel

            const a = line1Start.y - line2Start.y;
            const b = line1Start.x - line2Start.x;
            const numerator1 = ((line2End.x - line2Start.x) * a) - ((line2End.y - line2Start.y) * b);
            const numerator2 = ((line1End.x - line1Start.x) * a) - ((line1End.y - line1Start.y) * b);
            const ratio1 = numerator1 / denominator;
            const ratio2 = numerator2 / denominator;

            if (ratio1 >= 0 && ratio1 <= 1 && ratio2 >= 0 && ratio2 <= 1) {
                return new Point(
                    line1Start.x + (ratio1 * (line1End.x - line1Start.x)),
                    line1Start.y + (ratio1 * (line1End.y - line1Start.y))
                );
            }

            return null;
        };

        wallTool.onMouseDown = (event) => {
            if (!startPoint) {
                startPoint = adjustForSnap(rectangles, event.point, SNAP_THRESHOLD);
                polygonPoints.push(startPoint);
                wallColors.push(selectedWall.color);
            } else {
                const endPoint = adjustForSnap(rectangles, event.point, SNAP_THRESHOLD);
                let result;
                if (selectedWall.thickness) {
                    result = drawTempRectangle(endPoint, selectedWall.thickness);
                } else {
                    result = drawTempRectangle(endPoint, 10);
                }

                rectangles.push(result);
                shapesLayerRef.current.addChild(result.rectangle);
                shapesLayerRef.current.addChild(result.dashedLine);
                drawDimensionText(startPoint, endPoint);

                if (rectangles.length > 1) {
                    const prevRect = rectangles[rectangles.length - 2].rectangle;
                    const prevEnd = prevRect.segments[1].point;

                    const intersectionPoint = getIntersectionPoint(
                        prevRect.segments[0].point,
                        prevRect.segments[1].point,
                        startPoint,
                        endPoint
                    );

                    if (intersectionPoint) {
                        drawDiagonalLine(prevEnd, intersectionPoint, selectedWall.thickness || 10);
                    } else {
                        drawDiagonalLine(prevEnd, prevRect.segments[2].point, selectedWall.thickness || 10);
                    }
                }

                startPoint = endPoint;

                polygonPoints.push(endPoint);
                wallColors.push(selectedWall.color);

                if (polygonPoints.length > 2 && endPoint.getDistance(polygonPoints[0]) <= SNAP_THRESHOLD) {
                    const area = calculateArea(polygonPoints);
                    const id = Math.random().toString(36).substr(2, 9);
                    const currentRoomNumber = roomNumber;

                    // Adding wall data directly when closing the polygon
                    addWallData(area, wallColors, "Room - " + currentRoomNumber, currentRoomNumber, id);

                    drawRoomLabelForm(polygonPoints, id, currentRoomNumber); // Simplified call
                    setRoomNumber((prevNumber) => prevNumber + 1); // Increment room number

                    // Draw the diagonal line for the last joint
                    const firstRect = rectangles[0].rectangle;
                    const firstPoint = firstRect.segments[0].point;
                    const lastRect = rectangles[rectangles.length - 1].rectangle;
                    const lastPoint = lastRect.segments[1].point;
                    const finalIntersectionPoint = getIntersectionPoint(
                        firstRect.segments[0].point,
                        firstRect.segments[1].point,
                        lastRect.segments[2].point,
                        lastRect.segments[3].point
                    );


                    // if (finalIntersectionPoint) {
                    //     drawDiagonalLine(endPoint, finalIntersectionPoint, selectedWall.thickness || 10);
                    // } else {
                    //     drawDiagonalLine(endPoint, polygonPoints[0], selectedWall.thickness || 10);
                    // }

                    if (finalIntersectionPoint) {
                        drawDiagonalLine(lastPoint, finalIntersectionPoint, selectedWall.thickness || 10);
                    } else {
                        const intersectionWithFirst = getIntersectionPoint(
                            firstPoint,
                            firstRect.segments[1].point,
                            lastRect.segments[2].point,
                            lastRect.segments[3].point
                        );
                        if (intersectionWithFirst) {
                            drawDiagonalLine(lastPoint, intersectionWithFirst, selectedWall.thickness || 10);
                        } else {
                            drawDiagonalLine(lastPoint, firstPoint, selectedWall.thickness || 10);
                        }
                    }

                    polygonPoints = [];
                    resetAndActivateWallTool();
                }
            }
        };

        wallTool.onMouseMove = (event) => {
            if (startPoint) {
                if (tempRectangle) {
                    tempRectangle.rectangle.remove();
                    tempRectangle.dashedLine.remove();
                }

                const endPoint = adjustForSnap(rectangles, event.point, SNAP_THRESHOLD);
                if (selectedWall.thickness) {
                    tempRectangle = drawTempRectangle(endPoint, selectedWall.thickness);
                } else {
                    tempRectangle = drawTempRectangle(endPoint, 10);
                }

                tempRectangle.rectangle.strokeColor = selectedWall.color ? selectedWall.color : "blue";
                tempRectangle.rectangle.fillColor = 'rgba(128, 128, 128, 0.5)';

                if (startPoint.getDistance(endPoint) <= SNAP_THRESHOLD) {
                    tempRectangle.rectangle.strokeColor = 'red';
                }

                shapesLayerRef.current.addChild(tempRectangle.rectangle);
                shapesLayerRef.current.addChild(tempRectangle.dashedLine);
            }
        };

        wallTool.onMouseUp = (event) => {
            if (tempRectangle) {
                tempRectangle.rectangle.remove();
                tempRectangle.dashedLine.remove();
                tempRectangle = null;
            }
        };

        wallTool.onKeyDown = (event) => {
            if (event.key === 'escape') {
                rectangles.length = 0;
                polygonPoints.length = 0;
                resetAndActivateWallTool();
            }
        };

        if (drawWalls) {
            wallTool.activate();
        } else {
            console.log('test');
        }
    }, [selectedWall, drawWalls, selectedUnit, gridColor, thicknessValue, roomNumber, setWallData]);

    const handleRoomScheduleClick = () => {
        setScheduleModalOpen(true);
    };

    const handleSaveCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.href = canvas.toDataURL();
            link.download = 'drawing.png';
            link.click();
        }
    };

    const handleDropdownChange = (event) => {
        const selectedLabel = event.target.value;
        setSelectedValue(selectedLabel);

        // Find the selected wall from the walls array
        const selectedWall = walls.find(wall => wall.file.label === selectedLabel);
        if (selectedWall) {
            setSelectedWall({
                label: selectedWall.file.label,
                thickness: parseFloat(selectedWall.lastUpdated.label),
                color: selectedWall.color
            });
        } else {
            setSelectedWall({});
        }
    };

    return (
        <div className="mainClass">
            <canvas
                ref={canvasRef}
                width={2280} // Set to 2280 pixels to represent 228 meters
                height={1000} // Set to 1000 pixels to represent 100 meters
                style={{ ...canvasStyle }}
            />
            {!measurementComplete && instructionText && <div className="instruction-text">{instructionText}</div>}
            <>
                {moveInstruction && <div className="instruction-text">{moveInstruction}</div>}
            </>
            <div style={{ position: 'absolute', top: '-25%', left: '12%', zIndex: 999 }}>
                <Select
                    value={selectedValue}
                    onChange={handleDropdownChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    style={{ minWidth: 120, maxHeight: 25 }}
                >
                    <MenuItem value="">
                        <em>Select Wall</em>
                    </MenuItem>
                    {walls.map((wall, index) => (
                        <MenuItem key={index} value={wall.file.label}>{wall.file.label}</MenuItem>
                    ))}
                </Select>
            </div>
            <IconButton color="primary" onClick={handleWallThickness} style={{ position: "absolute", top: "2%", left: "98%", zIndex: "999" }}>
                <img src={ThicknessIcon} height='20' width='20' />
            </IconButton>
            {lineThicknessModal && (
                <Dialog
                    open={lineThicknessModal}
                    onClose={() => setLineThicknessModal(false)}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    PaperProps={{
                        style: { width: '400px', maxWidth: 'none', zIndex: 9999 },
                    }}
                >
                    <DialogTitle id="modal-title" style={{ fontWeight: "bold", display: 'flex', justifyContent: 'center' }}>Select Wall Thickness</DialogTitle>
                    <DialogContent>
                        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                            <div>
                                <div style={{ marginBottom: "10px" }}>Select Units</div>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                                    <Button variant="contained" color="primary" onClick={() => handleWallThicknessSelection(5)} style={{ backgroundColor: thicknessValue === 5 ? "#666CFF" : "#fff", textTransform: 'lowercase', borderRadius: "5px solid grey", color: thicknessValue === 5 ? "#fff" : "#000", marginBottom: "8px" }}>
                                        5
                                    </Button>
                                    <Button variant="contained" color="primary" onClick={() => handleWallThicknessSelection(15)} style={{ backgroundColor: thicknessValue === 15 ? "#666CFF" : "#fff", textTransform: 'lowercase', borderRadius: "5px solid grey", color: thicknessValue === 15 ? "#fff" : "#000", marginBottom: "8px" }}>
                                        15
                                    </Button>
                                    <Button variant="contained" color="primary" onClick={() => handleWallThicknessSelection(25)} style={{ backgroundColor: thicknessValue === 25 ? "#666CFF" : "#fff", textTransform: 'lowercase', borderRadius: "5px solid grey", color: thicknessValue === 25 ? "#fff" : "#000", marginBottom: "8px" }}>
                                        25
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button onClick={() => setLineThicknessModal(false)} color="primary" style={{ backgroundColor: "#666CFF", color: "#fff" }}>
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
            <IconButton color="primary" onClick={handleWallColor} style={{ position: "absolute", top: "2%", left: "94%", zIndex: "999" }}>
                <img src={ColorPickerIcon} height='20' width='20' />
            </IconButton>
            {colorModal && (
                <Dialog
                    open={colorModal}
                    onClose={() => setColorModal(false)}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    PaperProps={{
                        style: { width: '400px', maxWidth: 'none', zIndex: 9999 },
                    }}
                >
                    <DialogTitle id="modal-title" style={{ fontWeight: "bold", display: 'flex', justifyContent: 'center' }}>Select Wall Color</DialogTitle>
                    <DialogContent>
                        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
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
                    </DialogContent>
                    <DialogActions style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button onClick={() => setColorModal(false)} color="primary" style={{ backgroundColor: "#666CFF", color: "#fff" }}>
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
            <IconButton color="primary" onClick={handleRoomScheduleClick} style={{ position: "absolute", top: "2%", left: "90%", zIndex: "999" }}>
                <img src={wallDataIcon} height='20' width='20' />
            </IconButton>
            <Dialog
                open={scheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                aria-labelledby="schedule-modal-title"
                aria-describedby="schedule-modal-description"
                PaperProps={{
                    style: { width: '80%', maxWidth: 'none', zIndex: 9999 },
                }}
            >
                <DialogTitle id="schedule-modal-title" style={{ fontWeight: "bold", display: 'flex', justifyContent: 'center' }}>Room Schedule</DialogTitle>
                <DialogContent>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Reference No.</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Name</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Area</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Colors</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wallData.map((wall, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{wall.referenceNumber}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{wall.roomLabel}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{wall.area}</td>
                                    {wall.colors && (
                                        <td style={{ border: '1px solid black', padding: '8px' }}>
                                            {wall.colors.map((color, i) => (
                                                <div key={i} style={{ width: '20px', height: '20px', backgroundColor: color ? color : "blue", display: 'inline-block', margin: '2px' }}></div>
                                            ))}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button onClick={() => setScheduleModalOpen(false)} color="primary" style={{ backgroundColor: "#666CFF", color: "#fff" }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DrawingTool;
