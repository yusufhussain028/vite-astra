import React, { useEffect, useRef, useState } from 'react';
import paper, { Raster, PointText, Layer, Point, Path, Shape } from 'paper';
import tinycolor from 'tinycolor2';
import ThicknessIcon from '../../images/thickness-icon.png';
import ColorPickerIcon from '../../images/colorPicker.jpg'
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { SketchPicker } from 'react-color';
import './paperFile.css';

const DrawingTool = ({
    transparency, canvasStyle, uploadImage, newScale, onDistanceMeasured, toolEnabled, lockedImage, selectedUnit, drawWalls, gridTransparency, gridLineColor, gridScaleVal
}) => {
    const canvasRef = useRef(null);
    const textLayerRef = useRef(null);
    const gridLayerRef = useRef(null);
    const rasterLayerRef = useRef(null);
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

    // Function to get grid scale value
    const getScaleValue = (unit) => {
        console.log("enter scale val");
    };

    const SCALE_VALUE = getScaleValue(gridScaleVal);
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
        const wallTool = new paper.Tool();
        const moveTool = new paper.Tool();
        const dummyTool = new paper.Tool();

        let startPoint = null;
        let wallRectangle = null;
        let tempRectangle = null;
        const SNAP_THRESHOLD = 100; // pixels within which snapping occurs
        let rectangles = []; // Array to store drawn rectangles

        const resetAndActivateWallTool = () => {
            startPoint = null;  // Reset start point
            wallRectangle = null;    // Clear the current rectangle
            tempRectangle = null; // Clear the temporary rectangle
            wallTool.activate();  // Reactivate wall tool for new input
        };

        const createRectangleFromPoints = (start, end, thickness) => {
            const vector = end.subtract(start);
            const unitVector = vector.normalize();
            const perpendicularVector = new Point(-unitVector.y * thickness / 2, unitVector.x * thickness / 2);

            const topLeft = start.add(perpendicularVector);
            const bottomLeft = start.subtract(perpendicularVector);
            const topRight = end.add(perpendicularVector);
            const bottomRight = end.subtract(perpendicularVector);

            return new Path({
                segments: [topLeft, topRight, bottomRight, bottomLeft],
                closed: true,
                strokeColor: 'black',
                fillColor: 'grey',
                strokeWidth: 1,
                fullySelected: false
            });
        };

        const findSnapPoint = (point) => {
            for (let i = 0; i < rectangles.length; i++) {
                const rect = rectangles[i];
                const endPoint = rect.segments[2].point;
                if (point.getDistance(endPoint) <= SNAP_THRESHOLD) {
                    return endPoint;
                }
            }
            return point;
        };

        const createJoinedRectangle = (start, end, thickness) => {
            const vector = end.subtract(start);
            const unitVector = vector.normalize();
            const perpendicularVector = new Point(-unitVector.y * thickness / 2, unitVector.x * thickness / 2);

            const topLeft = start.add(perpendicularVector);
            const bottomLeft = start.subtract(perpendicularVector);
            const topRight = end.add(perpendicularVector);
            const bottomRight = end.subtract(perpendicularVector);

            return new Path({
                segments: [topLeft, topRight, bottomRight, bottomLeft],
                closed: true,
                strokeColor: 'black',
                fillColor: 'grey',
                strokeWidth: 1,
                fullySelected: false
            });
        };

        const adjustForSnap = (rectangles, point, threshold) => {
            for (let i = 0; i < rectangles.length; i++) {
                const rect = rectangles[i];
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
            if (rectangles.length > 0) {
                const previousRect = rectangles[rectangles.length - 1];
                return createJoinedRectangle(previousRect.segments[2].point, endPoint, thickness); // Use dynamic thicknessValue
            } else {
                return createRectangleFromPoints(startPoint, endPoint, thickness); // Use dynamic thicknessValue
            }
        };

        wallTool.onMouseDown = (event) => {
            if (!startPoint) {
                // First click sets the start point for a new wall
                startPoint = adjustForSnap(rectangles, event.point, SNAP_THRESHOLD);
            } else {
                // Create a new rectangle from startPoint to the current point
                const endPoint = adjustForSnap(rectangles, event.point, SNAP_THRESHOLD);
                wallRectangle = drawTempRectangle(endPoint, thicknessValue);

                rectangles.push(wallRectangle); // Store the rectangle
                startPoint = endPoint; // Reset start point to the end of the current wall
            }
        };

        wallTool.onMouseMove = (event) => {
            if (startPoint) {
                if (tempRectangle) {
                    tempRectangle.remove();
                }

                // Draw a temporary rectangle as the mouse moves
                const endPoint = adjustForSnap(rectangles, event.point, SNAP_THRESHOLD);
                tempRectangle = drawTempRectangle(endPoint, thicknessValue);

                tempRectangle.strokeColor = 'grey';
                tempRectangle.fillColor = 'rgba(128, 128, 128, 0.5)'; // Semi-transparent fill

                // Change color if snapping to start point
                if (startPoint.getDistance(endPoint) <= SNAP_THRESHOLD) {
                    tempRectangle.strokeColor = 'red';
                }
            }
        };

        wallTool.onMouseUp = (event) => {
            if (tempRectangle) {
                tempRectangle.remove();
                tempRectangle = null;
            }
        };

        wallTool.onKeyDown = (event) => {
            if (event.key === 'escape') {
                // When 'Esc' is pressed, reset the tool and start a new figure
                rectangles = [];
                resetAndActivateWallTool();
            }
        };

        // Assign wallTool to a ref to switch between tools if needed
        // This allows for toggling the wall drawing functionality
        if (drawWalls) {
            wallTool.activate();
        } else {
            console.log('test'); // Default tool for other functionalities
        }

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
                return
            }
            let spacing;
            if (selectedUnit === 'in') {
                spacing = (5.6 * gridScaleVal) / SCALE_FACTOR; // 1 inch = 2.54 cm
            } else if (selectedUnit === 'cm') {
                spacing = (5.6 * gridScaleVal) / SCALE_FACTOR; // 1 cm = 10 pixels
            } else if (selectedUnit === 'mm') {
                spacing = (5.6 * gridScaleVal) / SCALE_FACTOR; // 1 mm = 1 pixel
            } else if (selectedUnit === 'feet') {
                spacing = (5.6 * gridScaleVal) / SCALE_FACTOR; // 3.2 feet = 1 mter
            } else if (selectedUnit === 'meter') {
                spacing = (5.6 * gridScaleVal) // 1 meter = 5.6 pixel 
            } else {
                spacing = 5.6; // 1 meter as default
            }

            const gridTransparencyVal = gridTransparency / 100; // Assuming gridTransparencyValue is a percentage (0-100)
            const gridColorRgba = hexToRgbaString(gridLineColor, gridTransparencyVal);

            for (let x = bounds.left; x <= bounds.right; x += spacing) {
                const start = new Point(x, bounds.top);
                const end = new Point(x, bounds.bottom);
                const line = new Path.Line(start, end);
                line.strokeColor = new paper.Color(gridColorRgba);
                line.strokeWidth = 0.5 / paper.view.zoom; // Adjust thickness based on zoom
                gridLayer.addChild(line);
            }

            for (let y = bounds.top; y <= bounds.bottom; y += spacing) {
                const start = new Point(bounds.left, y);
                const end = new Point(bounds.right, y);
                const line = new Path.Line(start, end);
                line.strokeColor = new paper.Color(gridColorRgba);
                line.strokeWidth = 0.5 / paper.view.zoom; // Adjust thickness based on zoom
                gridLayer.addChild(line);
            }

            // Draw reference lines for x-axis and y-axis
            const xAxis = new Path.Line(
                new Point(bounds.left, paper.view.center.y),
                new Point(bounds.right, paper.view.center.y),
            );
            xAxis.strokeColor = 'blue';
            xAxis.strokeWidth = 1 / paper.view.zoom; // Adjust thickness based on zoom
            gridLayer.addChild(xAxis);

            const yAxis = new Path.Line(
                new Point(paper.view.center.x, bounds.top),
                new Point(paper.view.center.x, bounds.bottom),
            );
            yAxis.strokeColor = 'blue';
            yAxis.strokeWidth = 1 / paper.view.zoom; // Adjust thickness based on zoom
            gridLayer.addChild(yAxis);
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
            wallTool.remove();
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
    
        const SNAP_THRESHOLD = 100; // pixels within which snapping occurs
        let rectangles = []; // Array to store drawn rectangles
    
        const resetAndActivateWallTool = () => {
            startPoint = null;  // Reset start point
            tempRectangle = null; // Clear the temporary rectangle
            wallTool.activate();  // Reactivate wall tool for new input
        };
    
        const createRectangleFromPoints = (start, end, thickness) => {
            const vector = end.subtract(start);
            const unitVector = vector.normalize();
            const perpendicularVector = new Point(-unitVector.y * thickness / 2, unitVector.x * thickness / 2);
    
            const topLeft = start.add(perpendicularVector);
            const bottomLeft = start.subtract(perpendicularVector);
            const topRight = end.add(perpendicularVector);
            const bottomRight = end.subtract(perpendicularVector);
    
            return new Path({
                segments: [topLeft, topRight, bottomRight, bottomLeft],
                closed: true,
                strokeColor: 'black',
                fillColor: gridColor,
                strokeWidth: 1,
                fullySelected: false
            });
        };
    
        const findSnapPoint = (point) => {
            for (let i = 0; i < rectangles.length; i++) {
                const rect = rectangles[i];
                const endPoint = rect.segments[1].point;
                if (point.getDistance(endPoint) <= SNAP_THRESHOLD) {
                    return endPoint;
                }
            }
            return point;
        };
    
        const createJoinedRectangle = (start, end, thickness) => {
            const vector = end.subtract(start);
            const unitVector = vector.normalize();
            const perpendicularVector = new Point(-unitVector.y * thickness / 2, unitVector.x * thickness / 2);
    
            const topLeft = start.add(perpendicularVector);
            const bottomLeft = start.subtract(perpendicularVector);
            const topRight = end.add(perpendicularVector);
            const bottomRight = end.subtract(perpendicularVector);
    
            return new Path({
                segments: [topLeft, topRight, bottomRight, bottomLeft],
                closed: true,
                strokeColor: 'black',
                fillColor: gridColor,
                strokeWidth: 1,
                fullySelected: false
            });
        };
    
        const adjustForSnap = (rectangles, point, threshold) => {
            for (let i = 0; i < rectangles.length; i++) {
                const rect = rectangles[i];
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
            if (rectangles.length > 0) {
                const previousRect = rectangles[rectangles.length - 1];
                return createJoinedRectangle(previousRect.segments[1].point, endPoint, thickness); // Use dynamic thicknessValue
            } else {
                return createRectangleFromPoints(startPoint, endPoint, thickness); // Use dynamic thicknessValue
            }
        };
    
        wallTool.onMouseDown = (event) => {
            if (!startPoint) {
                // First click sets the start point for a new wall
                startPoint = adjustForSnap(rectangles, event.point, SNAP_THRESHOLD);
            } else {
                // Create a new rectangle from startPoint to the current point
                const endPoint = adjustForSnap(rectangles, event.point, SNAP_THRESHOLD);
                const wallRectangle = drawTempRectangle(endPoint, thicknessValue); // Use dynamic thicknessValue
    
                rectangles.push(wallRectangle); // Store the rectangle
                startPoint = endPoint; // Reset start point to the end of the current wall
            }
        };
    
        wallTool.onMouseMove = (event) => {
            if (startPoint) {
                if (tempRectangle) {
                    tempRectangle.remove();
                }
    
                // Draw a temporary rectangle as the mouse moves
                const endPoint = adjustForSnap(rectangles, event.point, SNAP_THRESHOLD);
                tempRectangle = drawTempRectangle(endPoint, thicknessValue); // Use dynamic thicknessValue
    
                tempRectangle.strokeColor = gridColor;
                tempRectangle.fillColor = 'rgba(128, 128, 128, 0.5)'; // Semi-transparent fill
    
                // Change color if snapping to start point
                if (startPoint.getDistance(endPoint) <= SNAP_THRESHOLD) {
                    tempRectangle.strokeColor = 'red';
                }
            }
        };
    
        wallTool.onMouseUp = (event) => {
            if (tempRectangle) {
                tempRectangle.remove();
                tempRectangle = null;
            }
        };
    
        wallTool.onKeyDown = (event) => {
            if (event.key === 'escape') {
                // When 'Esc' is pressed, reset the tool and start a new figure
                rectangles = [];
                resetAndActivateWallTool();
            }
        };
    
        // Assign wallTool to a ref to switch between tools if needed
        // This allows for toggling the wall drawing functionality
        if (drawWalls) {
            wallTool.activate();
        } else {
            console.log('test'); // Default tool for other functionalities
        }
    }, [thicknessValue, drawWalls]);
    

    const handleSaveCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.href = canvas.toDataURL();
            link.download = 'drawing.png';
            link.click();
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
            {/* <button onClick={handleSaveCanvas}>Save Canvas</button> */}
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
                        style: { width: '400px', maxWidth: 'none', zIndex: 9999 }, // Higher z-index for the modal
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
                                    <Button variant="contained" color="primary" onClick={() => handleWallThicknessSelection(10)} style={{ backgroundColor: thicknessValue === 10 ? "#666CFF" : "#fff", textTransform: 'lowercase', borderRadius: "5px solid grey", color: thicknessValue === 10 ? "#fff" : "#000", marginBottom: "8px" }}>
                                        15
                                    </Button>
                                    <Button variant="contained" color="primary" onClick={() => handleWallThicknessSelection(15)} style={{ backgroundColor: thicknessValue === 15 ? "#666CFF" : "#fff", textTransform: 'lowercase', borderRadius: "5px solid grey", color: thicknessValue === 15 ? "#fff" : "#000", marginBottom: "8px" }}>
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
                        style: { width: '400px', maxWidth: 'none', zIndex: 9999 }, // Higher z-index for the modal
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
        </div>
    );
};

export default DrawingTool;
