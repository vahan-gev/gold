import { useEffect, useRef } from 'react';
import Mine from './gold/Mine';
import './App.css';
import { Camera } from './gold/Camera';
import { Vector } from './gold/Math';
import { Box } from './gold/Box';
import { Color } from './gold/Color';
import { Scene } from './gold/Scene';
import brick from './assets/brick.png'
import cobblestone from './assets/cobblestone.png'
import { EventManager } from './gold/EventManager';

/*
    TODO:
    - Add lighting (ongoing)
    - Add textures to 3D models
    - Skeletal animation
    - Backface culling
    - Chunks
    - Raycasting
    - Audio Manager
    - Physics Engine
    - Collision Detection
    - Particle System
    - Networking
    - UI
    - Save/Load
*/

function App() {
    const CANVAS_WIDTH = document.documentElement.clientWidth;
    const CANVAS_HEIGHT = document.documentElement.clientHeight;
    const canvasRef = useRef();
    const eventManagerRef = useRef();
    const cameraRef = useRef();

    // Camera control states
    let moveSpeed = 5.0; // units per second
    const keysPressed = useRef(new Set());

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return; // Canvas is not supported in your browser

        const camera = new Camera();
        cameraRef.current = camera;
        const mine = new Mine(canvas, camera);
        camera.position = new Vector(0, 3, 10);
        const scene = new Scene();

        const box = new Box(mine.gl, new Color(1, 1, 0, 1), new Vector(0, 0, 0), new Vector(10, 0.05, 10), brick);
        const box2 = new Box(mine.gl, new Color(1, 1, 1, 1), new Vector(0, 2, 0), new Vector(2, 2, 2), cobblestone);
        scene.add(box);
        scene.add(box2);

        camera.lookAt(box2.position)

        const eventManager = new EventManager();
        eventManagerRef.current = eventManager;

        canvas.addEventListener('click', () => {
            eventManager.requestPointerLock(canvas);
        });

        // Handle mouse movement
        eventManager.addMouseListener('move', (movementX, movementY) => {
            const sensitivity = 0.002;
            const rotation = camera.rotation;
            rotation.y -= movementX * sensitivity;
            rotation.x = Math.max(
                -Math.PI / 2 + 0.001,
                Math.min(Math.PI / 2 - 0.001, 
                rotation.x - movementY * sensitivity)
            );
            camera.rotation = rotation;
        });

        const handleKeyDown = (event) => {
            keysPressed.current.add(event.key.toLowerCase());
        };

        const handleKeyUp = (event) => {
            keysPressed.current.delete(event.key.toLowerCase());
        };

        ['w', 'a', 's', 'd', ' ', 'shift', 'Control'].forEach(key => {
            eventManager.addKeyDown(key, handleKeyDown);
            eventManager.addKeyUp(key, handleKeyUp);
        });


        let lastTime = 0;
        // Draw the scene
        const animate = (currentTime) => {
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            const currentPosition = camera.position;
            let newPosition = new Vector(currentPosition.x, currentPosition.y, currentPosition.z);

            // Check current state of keys using eventManager
            if (eventManager.isKeyPressed('w')) {
                newPosition = newPosition.add(camera.front.multiply(moveSpeed * deltaTime));
            }
            if (eventManager.isKeyPressed('s')) {
                newPosition = newPosition.subtract(camera.front.multiply(moveSpeed * deltaTime));
            }
            if (eventManager.isKeyPressed('a')) {
                newPosition = newPosition.subtract(camera.right.multiply(moveSpeed * deltaTime));
            }
            if (eventManager.isKeyPressed('d')) {
                newPosition = newPosition.add(camera.right.multiply(moveSpeed * deltaTime));
            }
            if (eventManager.isKeyPressed(' ')) {
                newPosition.y += moveSpeed * deltaTime;
            }
            
            if (eventManager.isKeyPressed('shift')) {
                moveSpeed = 10.0;
            } else {
                moveSpeed = 5.0;
            }

            if (eventManager.isKeyPressed('Control')) {
                newPosition.y -= moveSpeed * deltaTime;
            }

            camera.position = newPosition;
            box2.rotation.y += deltaTime * 50;
            box2.rotation.x += deltaTime * 50;
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