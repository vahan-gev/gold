import { Matrix4f, Vector } from "./Math";

class Camera {
    constructor() {
        this._position = new Vector(0, 0, 0);
        this._rotation = new Vector(0, 0, 0); // pitch, yaw, roll
        this._front = new Vector(0, 0, -1);
        this._up = new Vector(0, 1, 0);
        this._right = new Vector(1, 0, 0);
        this.matrix4 = new Matrix4f();
        this.updateVectors();
        this.matrix = this.createMatrix();
    }

    updateVectors() {
        // Calculate new front vector
        const pitch = Math.max(-Math.PI/2 + 0.001, Math.min(Math.PI/2 - 0.001, this._rotation.x));
        const yaw = this._rotation.y;

        this._front = new Vector(
            Math.cos(pitch) * Math.sin(yaw),
            Math.sin(pitch),
            Math.cos(pitch) * Math.cos(yaw)
        );

        // Recalculate right and up vectors
        this._right = new Vector(
            Math.sin(yaw - Math.PI/2),
            0,
            Math.cos(yaw - Math.PI/2)
        );

        // Up vector is cross product of right and front
        const crossProduct = this._right.cross(this._front);
        this._up = new Vector(crossProduct.x, crossProduct.y, crossProduct.z);
    }

    get position() {
        return this._position;
    }

    set position(pos) {
        this._position = pos;
        this.matrix = this.createMatrix();
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(rot) {
        this._rotation = rot;
        this.updateVectors();
        this.matrix = this.createMatrix();
    }

    get front() {
        return this._front;
    }

    get right() {
        return this._right;
    }

    get up() {
        return this._up;
    }

    createMatrix() {
        const target = new Vector(
            this._position.x + this._front.x,
            this._position.y + this._front.y,
            this._position.z + this._front.z
        );

        // Create look-at matrix
        const zAxis = this._front.multiply(-1).unit;
        const xAxis = this._up.cross(zAxis).unit;
        const yAxis = zAxis.cross(xAxis).unit;

        const viewMatrix = [
            xAxis.x, yAxis.x, zAxis.x, 0,
            xAxis.y, yAxis.y, zAxis.y, 0,
            xAxis.z, yAxis.z, zAxis.z, 0,
            -(xAxis.dot(this._position)), 
            -(yAxis.dot(this._position)), 
            -(zAxis.dot(this._position)), 1
        ];

        return viewMatrix;
    }

    setRotation(axis, value) {
        const newRotation = new Vector(
            axis === 'x' ? value : this._rotation.x,
            axis === 'y' ? value : this._rotation.y,
            axis === 'z' ? value : this._rotation.z
        );
        this.rotation = newRotation;
    }

    lookAt(target) {
        // If target is not a Vector, create one
        if (!(target instanceof Vector)) {
            target = new Vector(target.x || 0, target.y || 0, target.z || 0);
        }

        // Calculate direction vector from camera to target
        const direction = target.subtract(this._position);

        // Calculate yaw (rotation around Y axis)
        // atan2 gives us the angle in radians between the positive x-axis and the point
        const yaw = Math.atan2(direction.x, direction.z);

        // Calculate pitch (rotation around X axis)
        // We need to calculate the distance in the XZ plane first
        const horizontalDistance = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
        const pitch = -Math.atan2(direction.y, horizontalDistance);

        // Update camera rotation
        this.rotation = new Vector(
            // Clamp pitch to avoid gimbal lock
            Math.max(-Math.PI/2 + 0.001, Math.min(Math.PI/2 - 0.001, pitch)),
            yaw,
            0  // We don't use roll in this camera system
        );
    }

    lookAtImmediate(x, y, z) {
        this.lookAt(new Vector(x, y, z));
    }
}

export { Camera };