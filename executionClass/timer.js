// globalTimer.js
export class GlobalTimer {
    constructor() {
        this.startTime = Date.now();
    }

    getElapsedTime() {
        return Date.now() - this.startTime;
    }
}
