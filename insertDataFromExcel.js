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
  const substring = fileContent.toString().substring(fileContent.indexOf('var d = {') + 8, fileContent.lastIndexOf("if (d['data'] == undefined)") - 7);  
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
        if (line.includes('},'))
        {        
          shouldDeleteLine = false;
        }
        line = '\n';
      }
      trimmedContent += line;
    });

  // For Debug:

  fs.writeFileSync('beautyObjectD.json', beautifyContent, function (err) {
    if (err) throw err;
   });

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

function getChildObject(childId) {
  let childObject;
  objectD.definitions.forEach(object => {
    if (object.id != undefined && object.id == childId)
    {
      childObject = object;       
    }
  });  
  return childObject;
}

function replaceTextInEnFile(childId, titleToReplace, itemText) {
  if (itemText != undefined) {
    for (i = 0; i < enFileAsArray.length; i++)
    {
      if (enFileAsArray[i].includes(childId))
      {
        enFileAsArray[i] = enFileAsArray[i].replace(titleToReplace, itemText);
        return true;
      }
    }      
  }
  
  return false;
};

function updateChildrenInEnFile(card, children) {
  children.forEach((child) => {
    let childId = child.replace('this.', '');
    let foundId = false;
    if (childId.includes("Label_"))
    {
      foundId = replaceTextInEnFile(childId, 'HeaderTitle', card.headerTitle);
      if (foundId) {
        let iconButtonId = getLinkId(childId, 'LinkBehaviour');
        if (iconButtonId != '')
        {
          foundId = replaceTextInEnFile(iconButtonId, 'Product', card.productLink);
        }   
      }
    }

    foundId = replaceTextInEnFile(childId, 'SubTitle', card.subTitle);
    if (foundId) {
      return; 
    }

    if (childId.includes("IconButton_"))
    {
      let iconButtonId = getIconButtonId(childId, 'PopupWebFrameBehaviour');
      if (iconButtonId != '')
      {
        replaceTextInEnFile(iconButtonId, 'Youtube', card.youtubeLink);
        replaceTextInEnFile(iconButtonId, 'Ts', card.tsLink);
        replaceTextInEnFile(iconButtonId, 'Dm', card.dmLink);
        replaceTextInEnFile(iconButtonId, 'Um', card.umLink);
        replaceTextInEnFile(iconButtonId, 'Ck', card.ckLink);
        replaceTextInEnFile(iconButtonId, 'Pic', card.photoLink);
      }  
    }  
  });
}

// let childObject = getChildObject(childId);
// if (childObject != undefined && childObject.data != undefined) {

function getIconButtonId(childId, prefixIndication) {
  let childObject = getChildObject(childId);
  if (childObject.click != undefined)
  {
    let clickString = childObject.click;
    let imageButtonId = clickString.substring(clickString.indexOf(prefixIndication), clickString.indexOf('));') - 1);
    return imageButtonId;
  }
  return '';
}

function getLinkId(childId, prefixIndication) {
  let childObject = getChildObject(childId);
  if (childObject.click != undefined)
  {
    let clickString = childObject.click;
    let imageButtonId = clickString.substring(clickString.indexOf(prefixIndication), clickString.indexOf('),') - 1);
    return imageButtonId;
  }
  return '';
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

