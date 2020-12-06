const fs = require("fs");

let content = fs.readFileSync("script_mobile.js");
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

fs.writeFileSync('output.json', substring, function (err) {
  if (err) throw err;
  console.log('Saved!');
});

let objectD = JSON.parse(substring);

const getCardChildren = () => {
  let children;
  objectD.definitions.forEach(card => {
    if (card.data != undefined && card.data.name == '/1009')
    {
      children = card.children;        
    }
  });  
  return children;
}

let cardChildren = getCardChildren();
let enFileContent = fs.readFileSync("en.txt");
let enFileAsArray = enFileContent.toString().split(/\n/);

const replaceTextInEnFile = (itemText) => {
  for (i = 0; i < enFileAsArray.length; i++)
  {
    if (enFileAsArray[i].includes(itemText))
    {
      enFileAsArray[i] = enFileAsArray[i].replace('TextToReplace', 'Guy!');
    }
  }
};

cardChildren.forEach((child) => {
  if (child.includes('HTMLText'))
  {
    let titleText = child.replace('this.', '');
    replaceTextInEnFile(titleText);
  }
  else if (child.includes('Label_2FAB3382'))
  {
    let subTitleText = child.replace('this.', '');
    replaceTextInEnFile(subTitleText);
  }
});

let updatedEnFileContent;
enFileAsArray.forEach(line => {
  updatedEnFileContent += line;
});

fs.writeFileSync('newEn.txt', updatedEnFileContent, function (err) {
  if (err) throw err;
  console.log('Saved nwe en.txt file');
});

console.log(cardChildren);
console.log('End');