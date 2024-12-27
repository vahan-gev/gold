import { Color } from "../Color";
import { Vector } from "../Math";

class Light {
    constructor(position, direction, color = new Color(1, 1, 1, 1)) {
        this.position = position;
        this.direction = direction;
        this.color = color;
    }
}

export {Light}