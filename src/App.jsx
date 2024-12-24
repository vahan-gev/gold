import { useEffect, useRef } from 'react';
import Mine from './gold/Mine';
import './App.css';
import { Camera } from './gold/Camera';
import { Vector } from './gold/Math';
import { Box } from './gold/Box';
import { Color } from './gold/Color';
import { Scene } from './gold/Scene';
import { Sphere } from './gold/Sphere';
import image from './assets/Vahan1.png'
function App() {
    const CANVAS_WIDTH = 1024;
    const CANVAS_HEIGHT = 512;
    const canvasRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return; // Canvas is not supported in your browser

        const camera = new Camera();

        const mine = new Mine(canvas, camera);
        camera.position = new Vector(0, 3, 3);
        // Not working without texture
        const box = new Box(mine.gl, new Color(1, 0.5, 0, 1), new Vector(0, 2, 0), new Vector(1, 1, 1), image);
        const scene = new Scene();
        camera.rotation.x = -Math.PI / 6;
        scene.add(box);

        let lastTime = 0;

        // Draw the scene
        const animate = (currentTime) => {
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            box.rotation.y += deltaTime * 50;
            box.rotation.x += deltaTime * 50;
            mine.draw(scene);
            window.requestAnimationFrame(animate);
        }

        animate(0);
    });
    return (
        <div>
            <canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={canvasRef}>
                <p>Your browser doesn't support this</p>
            </canvas>
        </div>
    );
}

export default App;