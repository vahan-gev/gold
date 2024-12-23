import { Matrix4f, Vector } from "./Math";

class Camera {
    constructor() {
        this._position = new Vector(0, 0, 0);
        this._rotation = new Vector(0, 0, 0);
        this.matrix4 = new Matrix4f();
        this.matrix = this.createMatrix(this._position, this._rotation);
    }

    get position() {
        return this._position;
    }

    set position(position) {
        this._position = position;
        this.updateMatrix();
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(rotation) {
        this._rotation = rotation;
        this.updateMatrix();
    }

    updateMatrix() {
        this.matrix = this.createMatrix(this._position, this._rotation);
    }

    createMatrix(position, rotation) {
        const { x, y, z } = position;
        const { x: rx, y: ry, z: rz } = rotation;
        const cameraMatrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -x, -y, -z, 1
        ];

        const rotationMatrixX = [
            1, 0, 0, 0,
            0, Math.cos(rx), -Math.sin(rx), 0,
            0, Math.sin(rx), Math.cos(rx), 0,
            0, 0, 0, 1
        ];

        const rotationMatrixY = [
            Math.cos(ry), 0, Math.sin(ry), 0,
            0, 1, 0, 0,
            -Math.sin(ry), 0, Math.cos(ry), 0,
            0, 0, 0, 1
        ];

        const rotationMatrixZ = [
            Math.cos(rz), -Math.sin(rz), 0, 0,
            Math.sin(rz), Math.cos(rz), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        const rotationMatrix = this.matrix4.multiply(rotationMatrixX, rotationMatrixY);
        const finalMatrix = this.matrix4.multiply(rotationMatrix, rotationMatrixZ);
        return this.matrix4.multiply(cameraMatrix, finalMatrix);
    }

    lookAt(position) {
        // Calculate direction vector from camera to target
        const direction = position.subtract(this._position);
        
        // Calculate rotation angles
        const distance = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
        
        // Calculate pitch (rotation around X axis)
        const pitch = -Math.atan2(direction.y, distance);
        
        // Calculate yaw (rotation around Y axis) 
        const yaw = Math.atan2(direction.x, direction.z);
        
        // Update camera rotation
        this.rotation = new Vector(pitch, yaw, 0);
    }
}

export { Camera };