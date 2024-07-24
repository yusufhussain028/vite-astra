import React, { useEffect, useRef, useState } from 'react';
import paper, { Raster, PointText, Layer, Point, Path, Shape } from 'paper';
import tinycolor from 'tinycolor2';
import './paperFile.css';

const DrawingTool = ({
    transparency, canvasStyle, uploadImage, newScale, onDistanceMeasured, toolEnabled, lockedImage, selectedUnit, drawWalls, lineThickness, gridTransparency, gridLineColor, gridScaleVal
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
        let wallPath = null;
        let tempPath = null;
        const SNAP_THRESHOLD = 500; // pixels within which snapping occurs
        let currentLineThickness = 10; // Default line thickness

        const resetAndActivateWallTool = () => {
            startPoint = null; // Reset start point
            wallPath = null; // Clear the current path
            tempPath = null; // Clear the temporary path
            wallTool.activate(); // Reactivate wall tool for new input
        };

        const displayDimension = (start, end) => {
            const distance = start.getDistance(end); // Calculate the distance
            const midpoint = new Point((start.x + end.x) / 2, (start.y + end.y) / 2); // Find the midpoint
            let textPoint;

            // Check if the line is more vertical than horizontal
            if (Math.abs(start.x - end.x) < Math.abs(start.y - end.y)) {
                // For vertical lines, adjust the text point to the right of the midpoint
                textPoint = new Point(midpoint.x - 28, midpoint.y);
            } else {
                // For horizontal lines, place the text above the line
                textPoint = new Point(midpoint.x, midpoint.y - 20);
            }

            const dimensionText = new PointText({
                point: textPoint,
                content: `${distance.toFixed(2)}${selectedUnit}`,
                fillColor: 'black',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: 10,
                justification: 'center',
            });
            dimensionText.bringToFront();
            textLayerRef.current.addChild(dimensionText);
        };

        wallTool.onMouseDown = (event) => {
            if (drawWalls) {
                if (!startPoint) {
                    // First click sets the start point for a new wall
                    startPoint = event.point;
                    // Initialize a new path with the start point
                    wallPath = new Path({
                        segments: [startPoint],
                        strokeColor: 'black',
                        strokeWidth: currentLineThickness,
                        fillColor: null,
                        fullySelected: true,
                    });
                } else {
                    // Add the current point to the path to complete the segment
                    wallPath.add(event.point);
                    // Display the dimension for the completed segment
                    displayDimension(startPoint, event.point);

                    // Check if the segment should be a dashed line
                    if (wallPath.segments.length > 2 && startPoint.getDistance(event.point) <= SNAP_THRESHOLD) {
                        wallPath.add(wallPath.firstSegment.point);
                        wallPath.strokeColor = 'black';
                        wallPath.dashArray = [];
                        if (tempPath) {
                            tempPath.remove(); // Remove temporary dashed line
                        }
                        resetAndActivateWallTool();
                    } else {
                        // Update startPoint for the next segment
                        startPoint = event.point;
                        // Initialize a new path from the current point to allow continuous drawing
                        wallPath = new Path({
                            segments: [startPoint],
                            strokeColor: 'black',
                            strokeWidth: currentLineThickness,
                            fillColor: null,
                            fullySelected: true,
                        });
                    }
                }
            }
        };

        wallTool.onMouseMove = (event) => {
            if (drawWalls && startPoint && wallPath) {
                if (startPoint && wallPath.firstSegment && event.point.getDistance(wallPath.firstSegment.point) <= SNAP_THRESHOLD) {
                    // If close to the first point, show a dashed line to the start point
                    if (!tempPath) {
                        tempPath = new Path({
                            segments: [wallPath.lastSegment.point, wallPath.firstSegment.point],
                            strokeColor: 'red',
                            strokeWidth: currentLineThickness,
                            dashArray: [10, 4],
                        });
                    } else {
                        tempPath.segments[1].point = wallPath.firstSegment.point;
                    }
                } else {
                    if (tempPath) {
                        tempPath.remove();
                        tempPath = null;
                    }
                    // Otherwise, update normally
                    if (wallPath.segments.length > 1) {
                        wallPath.lastSegment.point = event.point;
                    }
                }
            }
        };

        wallTool.onKeyDown = (event) => {
            if (event.key === 'escape' && drawWalls) {
                // When 'Esc' is pressed, finalize the current drawing and reset
                if (wallPath && wallPath.segments.length > 2 && wallPath.firstSegment.point.getDistance(wallPath.lastSegment.point) <= SNAP_THRESHOLD) {
                    // If the end is near the start and the user finalizes, snap it
                    wallPath.add(wallPath.firstSegment.point);
                    wallPath.strokeColor = 'black';
                    wallPath.dashArray = [];
                    if (tempPath) {
                        tempPath.remove(); // Remove temporary dashed line
                    }
                } else if (tempPath) {
                    // If there's a tempPath, convert it to a solid line
                    wallPath.add(tempPath.segments[1].point);
                    wallPath.strokeColor = 'black';
                    wallPath.dashArray = [];
                    tempPath.remove();
                }
                // wallPath.simplify(); // Optional, to simplify the path
                dummyTool.activate(); // Temporarily activate the dummy tool
                setTimeout(resetAndActivateWallTool, 10); // Reactivate wallTool shortly after
            }
        };

        // Update currentLineThickness based on key press
        wallTool.onKeyDown = (event) => {
            if (drawWalls) {
                switch (event.key) {
                    case '4':
                        currentLineThickness = 15;
                        break;
                    case '5':
                        currentLineThickness = 20;
                        break;
                    case '6':
                        currentLineThickness = 25;
                        break;
                    case 'escape':
                        // When 'Esc' is pressed, finalize the current drawing and reset
                        if (wallPath && wallPath.segments.length > 2 && wallPath.firstSegment.point.getDistance(wallPath.lastSegment.point) <= SNAP_THRESHOLD) {
                            // If the end is near the start and the user finalizes, snap it
                            wallPath.add(wallPath.firstSegment.point);
                            wallPath.strokeColor = 'black';
                            wallPath.dashArray = [];
                            if (tempPath) {
                                tempPath.remove(); // Remove temporary dashed line
                            }
                        } else if (tempPath) {
                            // If there's a tempPath, convert it to a solid line
                            wallPath.add(tempPath.segments[1].point);
                            wallPath.strokeColor = 'black';
                            wallPath.dashArray = [];
                            tempPath.remove();
                        }
                        // wallPath.simplify(); // Optional, to simplify the path
                        dummyTool.activate(); // Temporarily activate the dummy tool
                        setTimeout(resetAndActivateWallTool, 10); // Reactivate wallTool shortly after
                        break;
                    default:
                        break;
                }
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
                debugger
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
            debugger
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
    }, [checkImg, transparency, gridTransparency, uploadImage, newScale, imagePosition, toolEnabled, lockedImage, rasterPosition, selectedUnit, drawWalls, lineThickness, gridLineColor, gridScaleVal]);

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
        </div>
    );
};

export default DrawingTool;
