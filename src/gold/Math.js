/**
 * A private method for checking dimensions, throwing an exception when different.
 */
const checkDimensions = (v1, v2) => {
    if (v1.dimensions !== v2.dimensions) {
        throw Object.assign(
            new Error('Vectors have different dimensions'),
            { code: 402 }
        );
    }
}

// Define the class.
class Vector {
    constructor() {
        this.elements = [].slice.call(arguments)
    }

    get dimensions() {
        return this.elements.length
    }

    get x() {
        return this.elements[0]
    }

    set x(value) {
        this.elements[0] = value
    }

    get y() {
        return this.elements[1]
    }

    set y(value) {
        this.elements[1] = value
    }

    get z() {
        return this.elements[2]
    }

    set z(value) {
        this.elements[2] = value
    }

    get w() {
        return this.elements[3]
    }

    set w(value) {
        this.elements[3] = value
    }

    add(v) {
        let result = new Vector()

        checkDimensions(this, v)

        for (let i = 0, max = this.dimensions; i < max; i += 1) {
            result.elements[i] = this.elements[i] + v.elements[i]
        }

        return result
    }

    subtract(v) {
        let result = new Vector()

        checkDimensions(this, v)

        for (let i = 0, max = this.dimensions; i < max; i += 1) {
            result.elements[i] = this.elements[i] - v.elements[i]
        }

        return result
    }

    multiply(s) {
        let result = new Vector()

        for (let i = 0, max = this.dimensions; i < max; i += 1) {
            result.elements[i] = this.elements[i] * s
        }

        return result
    }

    divide(s) {
        let result = new Vector()

        for (let i = 0, max = this.dimensions; i < max; i += 1) {
            result.elements[i] = this.elements[i] / s
        }

        return result
    }

    dot(v) {
        let result = 0

        checkDimensions(this, v)

        for (let i = 0, max = this.dimensions; i < max; i += 1) {
            result += this.elements[i] * v.elements[i]
        }

        return result
    }

    cross(v) {
        if (this.dimensions !== 3 || v.dimensions !== 3) {
            throw Object.assign(
                new Error('Cross product is for 3D vectors only.'),
                { code: 402 }
            );
        }

        // With 3D vectors, we can just return the result directly.
        return new Vector(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x)
    }

    get magnitude() {
        return Math.sqrt(this.dot(this))
    }

    get unit() {
        // At this point, we can leverage our more "primitive" methods.
        return this.divide(this.magnitude)
    }

    // https://webglfundamentals.org/webgl/lessons/webgl-3d-camera.html
    normalize(v) {
        let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (length > 0.00001) {
            return new Vector(v[0] / length, v[1] / length, v[2] / length);
        } else {
            return new Vector(0, 0, 0);
        }
    }

    projection(v) {
        checkDimensions(this, v)

        // Plug and chug :)
        // The projection of u onto v is u dot the unit vector of v
        // times the unit vector of v.
        let unitv = v.unit
        return unitv.multiply(this.dot(unitv))
    }
}

class Matrix4f {
    constructor() {
        this.matrix = this.createIdentity();
    }

    createIdentity() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }

    createTranslation(tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    }

    createScaling(sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    }

    // Based on the original glRotate reference:
    // https://www.khronos.org/registry/OpenGL-Refpages/es1.1/xhtml/glRotate.xml
    createRotation(angle, x, y, z) {
        const axisLength = Math.sqrt(x * x + y * y + z * z);
        const s = Math.sin((angle * Math.PI) / 180.0);
        const c = Math.cos((angle * Math.PI) / 180.0);
        const oneMinusC = 1.0 - c;
        x /= axisLength;
        y /= axisLength;
        z /= axisLength;

        const x2 = x * x;
        const y2 = y * y;
        const z2 = z * z;
        const xy = x * y;
        const yz = y * z;
        const xz = x * z;
        const xs = x * s;
        const ys = y * s;
        const zs = z * s;

        return [
            x2 * oneMinusC + c,
            xy * oneMinusC + zs,
            xz * oneMinusC - ys,
            0.0,

            xy * oneMinusC - zs,
            y2 * oneMinusC + c,
            yz * oneMinusC + xs,
            0.0,

            xz * oneMinusC + ys,
            yz * oneMinusC - xs,
            z2 * oneMinusC + c,
            0.0,

            0.0,
            0.0,
            0.0,
            1.0
        ];
    }

    multiply(a, b) {
        let result = new Array(16);
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                result[row * 4 + col] = 0;
                for (let i = 0; i < 4; i++) {
                    result[row * 4 + col] += a[row * 4 + i] * b[i * 4 + col];
                }
            }
        }
        return result;
    }

    createOrthographic(left, right, bottom, top, near, far) {
        return [
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, -2 / (far - near), 0,
            -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1,
        ];
    }

    createPerspective(fov, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fov * Math.PI / 180);
        const rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0,
        ];
    }
}

export { Vector, Matrix4f };
