const fs = require("fs");
const beautify = require('js-beautify').js;

let objectD = parseFileToObject();
let enFileContent = fs.readFileSync("en.txt");
let enFileAsArray = enFileContent.toString().split(/\n/);

// TODO: Create this array from excel file
cardsData = [
  {
    cardName: "1009",
    headerTitle: "Volvo Penta D2-75",
    subTitle: "Volvo Penta D2-75 with saildrive and 4 blade Volvo Penta propeller"
  },
  {
    cardName: "1024",
    headerTitle: "DC ELECTRIC PANEL",
    subTitle: "DC 12V ELECTRIC service PANEL"
  },
  {
    cardName: "1025",
    headerTitle: "AC ELECTRIC PANEL",
    subTitle: "AC 115/230V ELECTRIC service PANEL"
  }
]

cardsData.forEach(card => {
  let children = getCardChildren(card.cardName);
  updateChildrenInEnFile(card, children);
});

updateEnFile();

function parseFileToObject() {
  let fileContent = fs.readFileSync("script_mobile.js");  
  const substring = fileContent.toString().substring(fileContent.indexOf('var b = {') + 8, fileContent.lastIndexOf("if (b['data'] == undefined)") - 7);  
  let beautifyContent = beautify(substring, { indent_size: 4, space_in_empty_paren: true });

  let trimmedContent = ""; 
  let shouldDeleteLine = false;
  beautifyContent.toString().split(/\n/).forEach(function(line){
      if (line.includes('trans('))
      {
          line = line.replace('trans(', '"trans(');
          line = line.replace(')', ')"');
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
        if (line === '    },')
        {        
          shouldDeleteLine = false;
        }
        line = '\n';
      }
      trimmedContent += line;
    });

  // For Debug:

  // fs.writeFileSync('beautyObjectD.json', beautifyContent, function (err) {
  //   if (err) throw err;
  //  });

  fs.writeFileSync('parseableObjectD.json', trimmedContent, function (err) {
    if (err) throw err;
   });

  return JSON.parse(trimmedContent);
}

function getCardChildren(cardName) {
  let children;
  objectD.definitions.forEach(card => {
    if (card.data != undefined && card.data.name == '/' + cardName)
    {
      children = card.children;        
    }
  });  
  return children;
}

function replaceTextInEnFile(childId, titleToReplace, itemText) {
  for (i = 0; i < enFileAsArray.length; i++)
  {
    if (enFileAsArray[i].includes(childId))
    {
      enFileAsArray[i] = enFileAsArray[i].replace(titleToReplace, itemText);
    }
  }
};

function updateChildrenInEnFile(card, children) {
  children.forEach((child) => {
    let childId = child.replace('this.', '');
    replaceTextInEnFile(childId, 'HeaderTitle', card.headerTitle);
    replaceTextInEnFile(childId, 'SubTitle', card.subTitle)
  });
}


function updateEnFile() {
  let updatedEnFileContent;
  enFileAsArray.forEach(line => {
    updatedEnFileContent += line;
  });

  fs.writeFileSync('newEn.txt', updatedEnFileContent, function (err) {
    if (err) throw err;
  });
}

console.log('End');