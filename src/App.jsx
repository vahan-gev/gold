import { useEffect, useRef } from 'react';
import Mine from './gold/Mine';
import './App.css';
import { Camera } from './gold/Camera';
import { Vector } from './gold/Math';

function App() {
  const CANVAS_WIDTH = 1024;
  const CANVAS_HEIGHT = 512;
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Canvas is not supported in your browser

    const camera = new Camera();

    const mine = new Mine(canvas, camera);
    camera.position = new Vector(0, 0, 1);
    
    let lastTime = 0;
    // Draw the scene
    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      camera.rotation.y += deltaTime;
      mine.draw();
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