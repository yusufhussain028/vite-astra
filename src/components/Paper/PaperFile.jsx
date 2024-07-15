import React, { useEffect, useRef, useState } from 'react';
import paper, { Raster, PointText, Layer, Point, Path } from 'paper';
import './paperFile.css';

const DrawingTool = ({ transparency, canvasStyle, uploadImage, scaleDimn, newScale }) => {
    const canvasRef = useRef(null);
    const textLayerRef = useRef(null);
    const gridLayerRef = useRef(null);
    const [checkImg, setCheckImg] = useState(false);
    const [distanceText, setDistanceText] = useState('');

    useEffect(() => {
        const loadImage = async () => {
            const img = new Image();
            img.onload = () => {
                const raster = new Raster(img);
                raster.position = paper.view.center;
                raster.scale(newScale ? newScale : scaleDimn);
                raster.sendToBack();
                raster.opacity = transparency / 100;
                setCheckImg(true);
            };
            img.src = uploadImage;
        };

        paper.setup(canvasRef.current);
        loadImage();

        let point1 = null;
        let point2 = null;

        const tool = new paper.Tool();

        tool.onMouseDown = (event) => {
            if (!point1) {
                point1 = event.point;
            } else if (!point2) {
                point2 = event.point;
                const distance = calculateDistance(point1, point2);
                setDistanceText(`Distance: ${distance.toFixed(2)} m`);
                drawDistanceLine(point1, point2);
                drawDistanceText(point1, point2, distance);
                point1 = null;
                point2 = null;
            }
        };

        tool.onKeyDown = (event) => {
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
                    point1 = null;
                    point2 = null;
                    setDistanceText('');
                    break;
                default:
                    break;
            }
        };

        const calculateDistance = (p1, p2) => {
            const distanceInPixels = p1.getDistance(p2);
            return distanceInPixels / 10; // Convert pixels to meters
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
                content: `Distance: ${distance.toFixed(2)} m`,
                fillColor: 'black',
                fontSize: 12,
            });
            textLayerRef.current.addChild(text);
        };

        const clearDistanceLine = () => {
            const distanceLines = paper.project.activeLayer.children.filter(
                (child) => child.name === 'distanceLine'
            );
            distanceLines.forEach((line) => line.remove());
        };

        const clearDistanceText = () => {
            textLayerRef.current.removeChildren();
        };

        const drawGrid = () => {
            const gridLayer = gridLayerRef.current;
            gridLayer.removeChildren();
            const bounds = paper.view.bounds;

            const baseSpacing = 10; // Base grid spacing in pixels
            const spacing = baseSpacing * paper.view.zoom; // Adjusted grid spacing based on zoom

            for (let x = bounds.left; x <= bounds.right; x += spacing) {
                const start = new Point(x, bounds.top);
                const end = new Point(x, bounds.bottom);
                const line = new Path.Line(start, end);
                line.strokeColor = new paper.Color(0.8, 0.8, 0.8);
                line.strokeWidth = 0.5;
                gridLayer.addChild(line);
            }

            for (let y = bounds.top; y <= bounds.bottom; y += spacing) {
                const start = new Point(bounds.left, y);
                const end = new Point(bounds.right, y);
                const line = new Path.Line(start, end);
                line.strokeColor = new paper.Color(0.8, 0.8, 0.8);
                line.strokeWidth = 0.5;
                gridLayer.addChild(line);
            }

            // Draw reference lines for x-axis and y-axis
            const center = paper.view.center;
            const xAxis = new Path.Line(
                new Point(bounds.left, center.y),
                new Point(bounds.right, center.y)
            );
            xAxis.strokeColor = 'blue';
            xAxis.strokeWidth = 1;
            gridLayer.addChild(xAxis);

            const yAxis = new Path.Line(
                new Point(center.x, bounds.top),
                new Point(center.x, bounds.bottom)
            );
            yAxis.strokeColor = 'blue';
            yAxis.strokeWidth = 1;
            gridLayer.addChild(yAxis);

            gridLayer.sendToBack();
        };

        const updateCanvasSizeText = () => {
            const textLayer = textLayerRef.current;
            textLayer.removeChildren();

            const widthInMeters = paper.view.size.width / 10;
            const heightInMeters = paper.view.size.height / 10;

            new PointText({
                point: new Point(10, 50),
                content: `Width: ${widthInMeters.toFixed(2)} m`,
                fillColor: 'black',
                fontSize: 12,
                parent: textLayer
            });

            new PointText({
                point: new Point(10, 70),
                content: `Height: ${heightInMeters.toFixed(2)} m`,
                fillColor: 'black',
                fontSize: 12,
                parent: textLayer
            });
        };

        const textLayer = new Layer();
        textLayerRef.current = textLayer;

        const gridLayer = new Layer();
        gridLayerRef.current = gridLayer;

        updateCanvasSizeText();
        drawGrid();

        const handleScroll = (event) => {
            event.preventDefault();
            const delta = event.deltaY > 0 ? 0.9 : 1.1;

            // Update the view's zoom factor
            paper.view.zoom *= delta;

            updateCanvasSizeText();

            // Log zoom factor for debugging
            console.log(`Zoom factor: ${paper.view.zoom}`);

            // Redraw the grid to reflect the new zoom level
            drawGrid(); // Adjust grid spacing based on zoom
        };

        window.addEventListener('wheel', handleScroll, { passive: false });

        return () => {
            if (canvasRef.current) {
                paper.remove();
            }
            window.removeEventListener('wheel', handleScroll);
        };
    }, [checkImg, transparency, uploadImage, newScale]);

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
        <div className='mainClass'>
            <canvas
                ref={canvasRef}
                width={1000}  // 100 meters * 10 pixels per meter
                height={1000} // 100 meters * 10 pixels per meter
                style={{ ...canvasStyle }}
            />
            {/* <button onClick={handleSaveCanvas}>Save Canvas</button> */}
        </div>
    );
};

export default DrawingTool;
