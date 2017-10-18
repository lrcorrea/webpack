/*class Main {
    // window: string;
    constructor() {
        console.log('constructor Main');
        this.window = window.document;
    }

    getWindowDom() {
        console.log('getWindowDom');
        return this.window;
    }
}

let app = new Main();*/

module.exports = function(str) {
    return str.toUpperCase();
};