const fs = require("fs");

let content = fs.readFileSync("script_mobile.js");
// content.toString().split(/\n/).forEach(function(line){
//     console.log(line);
//   });

// console.log(content.toString());

const substring = content.toString().substring(content.indexOf('var d = {') + 8, content.lastIndexOf('};') + 1);
// console.log(content.toString().substring(content.indexOf('var d = {'), content.lastIndexOf('};') + 1));
let objectD = JSON.parse(substring);
console.log('End');