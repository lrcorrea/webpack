import { sayHello } from "./../../../main/assets/js/main";

console.log(sayHello("TypeScript"));

function hello(compiler: string) {
    console.log('Hello from ${compiler}');
}
hello("TypeScript");