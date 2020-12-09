const fs = require("fs");
const beautify = require('js-beautify').js;
const excelToJson = require('convert-excel-to-json');

let cardsData = getCardsDataFromExcelFile('test.xlsx');
let objectD = parseFileToObject('script_mobile.js');
let enFileContent = fs.readFileSync('en.txt');
let enFileAsArray = enFileContent.toString().split(/\n/);

cardsData.forEach(card => {
  let children = getCardChildren(card.cardName);
  updateChildrenInEnFile(card, children);
});

updateEnFile('newEn.txt');

function getCardsDataFromExcelFile(filePath) {
  let cardsData = excelToJson({
    sourceFile: filePath,
    header: { rows: 1 },
    columnToKey: {
        A: "cardName",
        B: "headerTitle",
        C: "subTitle",
        D: "youtubeLink",
        E: "productLink",
        F: "tsLink",
        G: "dmLink",
        H: "umLink",
        I: "ckLink",
        J: "photoLink"
    }
  })

  return cardsData[Object.keys(cardsData)[0]];
}

function parseFileToObject(filePath) {
  let fileContent = fs.readFileSync(filePath);  
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

  // fs.writeFileSync('parseableObjectD.json', trimmedContent, function (err) {
  //   if (err) throw err;
  //  });

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
    replaceTextInEnFile(childId, 'SubTitle', card.subTitle);
    replaceTextInEnFile(childId, 'Vid', card.youtubeLink);
    replaceTextInEnFile(childId, 'Product', card.productLink);
    replaceTextInEnFile(childId, 'Ts', card.tsLink);
    replaceTextInEnFile(childId, 'Dm', card.dmLink);
    replaceTextInEnFile(childId, 'Um', card.umLink);
    replaceTextInEnFile(childId, 'Ck', card.ckLink);
    replaceTextInEnFile(childId, 'Photo', card.photoLink);
  });
}


function updateEnFile(filePath) {
  let updatedEnFileContent;
  enFileAsArray.forEach(line => {
    updatedEnFileContent += line;
  });

  fs.writeFileSync(filePath, updatedEnFileContent, function (err) {
    if (err) throw err;
  });
}

console.log('End');

