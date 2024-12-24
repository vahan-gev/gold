import { useEffect, useRef } from 'react';
import Mine from './gold/Mine';
import './App.css';
import { Camera } from './gold/Camera';
import { Vector } from './gold/Math';
import { Box } from './gold/Box';
import { Color } from './gold/Color';
import { Scene } from './gold/Scene';
import { Sphere } from './gold/Sphere';
import brick from './assets/brick.png'
import wool from './assets/wool.png'
import { Model } from './gold/Model';
function App() {
    const CANVAS_WIDTH = 1024;
    const CANVAS_HEIGHT = 512;
    const canvasRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return; // Canvas is not supported in your browser

        const camera = new Camera();

        const mine = new Mine(canvas, camera);
        camera.position = new Vector(0, 1.5, 3);
        const box = new Box(mine.gl, new Color(1, 1, 0, 1), new Vector(0, 1.5, 0), new Vector(1, 1, 1), brick);
        const sphere = new Sphere(mine.gl, new Color(1, 0.5, 0, 1), new Vector(2, 1.5, 0), new Vector(0.5, 0.5, 0.5), 20, wool);
       
        // sphere.wireframe = true;
        const scene = new Scene();
        // scene.add(box);
        // scene.add(sphere);
        let model;
        async function loadModels() {
            model = await Model.create(mine.gl, new Color(0.5, 0.5, 0.5, 0), new Vector(0, 0, 0), new Vector(0.3, 0.3, 0.3), './chair.obj');
            // model.wireframe = true;
            scene.add(model);
        }

        loadModels();
        let lastTime = 0;

        // Draw the scene
        const animate = (currentTime) => {
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            box.rotation.y += deltaTime * 50;
            if (model) {
                model.rotation.y += deltaTime * 50;
            }
            box.rotation.x += deltaTime * 50;
            sphere.rotation.y += deltaTime * 50;
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