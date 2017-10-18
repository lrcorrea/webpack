// document.write(require("./application/modules/main/main.js"));
/*require('./../../../main/assets/js/main.js');

class Home {
    constructor(){
        console.log('constructor home');
        let test = super.getWindowDom();
        console.log(test);
    }
}

let home = new Home();*/

var app = require('./../../../main/assets/js/main.js');
console.log(app('test'));