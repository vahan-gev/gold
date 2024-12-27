import { Light } from "./Light";

class DiffuseLighting extends Light {
    constructor(position, direction, color) {
        super(position, direction, color);
    }
}
export { DiffuseLighting };