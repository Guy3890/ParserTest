const fs = require("fs");

let content = fs.readFileSync("./ParserTest/script_mobile.js");
let trimmedContent = ""; 
let shouldDeleteLine = false;
content.toString().split(/\n/).forEach(function(line){
    if (line.includes('trans('))
    {
        line = '\n';
    }
    else if (line.includes('"this."'))
    {
      line = line.replace('"this."', '"this.",');
    }
    else if (line.includes("scripts"))
    {
      line = '\n';
      shouldDeleteLine = true;
    }
    else if (shouldDeleteLine)
    {
      if (line === '        },\r')
      {        
        shouldDeleteLine = false;
      }
      line = '\n';
    }
    trimmedContent += line;
  });


const substring = trimmedContent.toString().substring(trimmedContent.indexOf('var d = {') + 8, trimmedContent.lastIndexOf("if (d['data'] == undefined)") - 6);

fs.writeFileSync('./ParserTest/output.json', substring, function (err) {
  if (err) throw err;
  console.log('Saved!');
});

let objectD = JSON.parse(substring);
console.log('End');