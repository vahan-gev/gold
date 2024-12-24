class EventManager {
    constructor() {
        this.keyDownListeners = new Map();
        this.keyUpListeners = new Map();
        this.mouseListeners = new Map();
        this.isPointerLocked = false;
        this.pressedKeys = new Set();
        
        // Bind the handlers to maintain consistent 'this' context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousemove', this.handleMouseMove);
        // Add blur event to clear keys when window loses focus
        window.addEventListener('blur', this.handleBlur.bind(this));
        
        this.mouseSensitivity = 0.002;
        this.movementX = 0;
        this.movementY = 0;
    }

    addKeyDown(key, func) {
        if(!this.keyDownListeners.has(key)) {
            this.keyDownListeners.set(key, new Set());
        }
        this.keyDownListeners.get(key).add(func);
    }

    addKeyUp(key, func) {
        if(!this.keyUpListeners.has(key)) {
            this.keyUpListeners.set(key, new Set());
        }
        this.keyUpListeners.get(key).add(func);
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        this.pressedKeys.add(key);
        const listeners = this.keyDownListeners.get(key);
        if(listeners) {
            listeners.forEach(func => func(event));
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        this.pressedKeys.delete(key);
        const listeners = this.keyUpListeners.get(key);
        if(listeners) {
            listeners.forEach(func => func(event));
        }
    }

    handleBlur() {
        // Clear all pressed keys when window loses focus
        this.pressedKeys.clear();
        // Notify all key up listeners
        this.keyUpListeners.forEach((listeners, key) => {
            listeners.forEach(func => func({ key }));
        });
    }

    isKeyPressed(key) {
        return this.pressedKeys.has(key.toLowerCase());
    }

    handleMouseMove(event) {
        if (document.pointerLockElement) {
            this.movementX = event.movementX;
            this.movementY = event.movementY;
            
            const listeners = this.mouseListeners.get('move');
            if(listeners) {
                listeners.forEach(func => func(this.movementX, this.movementY));
            }
        }
    }

    addMouseListener(type, func) {
        if(!this.mouseListeners.has(type)) {
            this.mouseListeners.set(type, new Set());
        }
        this.mouseListeners.get(type).add(func);
    }

    requestPointerLock(element) {
        element.requestPointerLock = element.requestPointerLock || 
                                   element.mozRequestPointerLock || 
                                   element.webkitRequestPointerLock;
        element.requestPointerLock();
    }

    clean() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('blur', this.handleBlur);
    }
}

export { EventManager }