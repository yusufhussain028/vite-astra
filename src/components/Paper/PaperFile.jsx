import React, { useEffect, useRef, useState } from 'react';
import paper, { Raster } from 'paper';
import './paperFile.css';

const DrawingTool = ({transparency}) => {
    const canvasRef = useRef(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [checkImg, setCheckImg] = useState();

    useEffect(() => {
        const loadImage = async () => {
            const img = new Image();
            img.onload = () => {
                // Create a new Raster object in Paper.js
                const raster = new Raster(img);
                raster.position = paper.view.center; // Center the raster
                raster.scale(0.45); // Scale if needed
                raster.sendToBack(); // Send to the back to act as background

                // Set the opacity of the raster based on transparency prop
                raster.opacity = transparency / 100;

                // Save the loaded image reference
                setBackgroundImage(raster);
                setCheckImg(1)
            };

            // Replace '/path/to/your/image.jpg' with your actual image path
            img.src = '../../../public/assets/drawing1.gif';
        };

        // Initialize Paper.js on the canvas element
        paper.setup(canvasRef.current);

        // Load the image after Paper.js setup
        loadImage(); 

        // Set up Paper.js tool and event handlers
        let myPath;
        const tool = new paper.Tool();

        tool.onMouseDown = (event) => {
            myPath = new paper.Path();
            myPath.strokeColor = 'black';
            myPath.strokeWidth = 1;
        };

        tool.onMouseDrag = (event) => {
            myPath.add(event.point);
        };

        tool.onKeyDown = (event) => {
            if (!myPath) return;
            switch (event.key) {
                case '1':
                    myPath.strokeWidth = 5;
                    return false;
                case '2':
                    myPath.strokeWidth = 10;
                    return false;
                case '3':
                    myPath.strokeWidth = 15;
                    return false;
                case 'space':
                    myPath.strokeColor = 'red';
                    return false;
                default:
                    break;
            }
        };

        // Zoom in and zoom out functionality
        const handleMouseWheel = (event) => {
            const zoomFactor = 1.1;
            const oldZoom = paper.view.zoom;
            const mousePosition = new paper.Point(event.offsetX, event.offsetY);
            const viewPosition = paper.view.viewToProject(mousePosition);

            if (event.deltaY < 0) {
                // Zoom in
                paper.view.zoom *= zoomFactor;
            } else {
                // Zoom out
                paper.view.zoom /= zoomFactor;
            }

            const newZoom = paper.view.zoom;
            const zoomRatio = newZoom / oldZoom;
            const centerPoint = viewPosition.subtract(paper.view.center);
            const offset = centerPoint.multiply(zoomRatio - 1);
            paper.view.center = paper.view.center.add(offset);
        };

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleMouseWheel);
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('wheel', handleMouseWheel);
                paper.remove();
            }
        };
    }, [checkImg]);

    const handleSaveCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.href = canvas.toDataURL(); // Create a data URL of the canvas
            link.download = 'drawing.png'; // Set the download attribute
            link.click(); // Simulate click to trigger download
        }
    };

    return (
        <div className='mainClass'>
            <h2>
                Drawing Tool
            </h2>
            <p>
                Testing to change width and color of line
            </p>
                <canvas
                    ref={canvasRef}
                    resize="true"
                    style={{ width: '100%', height: '400px', backgroundSize: 'cover' }}
                />
            <button onClick={handleSaveCanvas}>Save Canvas</button>
        </div>
    );
};

export default DrawingTool;
