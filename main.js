const vsc = require('vscode');

exports.activate = function(context) {
    for (const language of ['sql']) {
        let handle = vsc.languages.registerColorProvider(
            { language }, 
            {
                provideDocumentColors,
                provideColorPresentations,
            }
        ); 
        context.subscriptions.push(handle);
    }
}

function provideDocumentColors(document, _token) {
    const text = document.getText();
    const regex = /0x[0-9a-f]{6}[0-9a-f]{2}?/g;
    return [...text.matchAll(regex)].map( (match) => {
        const start = getPosition(text, match.index);
        const end = getPosition(text, match.index + match[0].length);
        console.log(match[0].length)
        
        const range = new vsc.Range(start, end);
        const color = readHexColor(match[0]);

        return new vsc.ColorInformation(range, color);
    });
}

function provideColorPresentations(color, _context, _token) {
    try {
    const hex_color = writeHexColor(color)
    return [ new vsc.ColorPresentation(hex_color) ];
    } catch (e) { console.error(e) }
}

function readHexColor(hexstring) {
    return new vsc.Color(
        parseInt(hexstring.slice(2, 4), 16)/255,
        parseInt(hexstring.slice(4, 6), 16)/255,
        parseInt(hexstring.slice(6, 8), 16)/255,
        hexstring.length == 10 ? parseInt(hexstring.slice(8, 10), 16)/255 : 1.0
    )
}
function writeHexColor(color) {
    let string = '0x'; 
    for (let value of [color.red, color.green, color.blue, color.alpha]) {
        value *= 255
        const sixteens = Math.floor(value / 16);
        const ones = Math.floor(value % 16);
        string = string.concat(sixteens.toString(16), ones.toString(16));
    }
    if (string.length != 10) {
        throw new Error("failed to parse chosen color");
    }
    return string
}
function getPosition(text, index) {
    const lines = [...text.slice(0, index).matchAll(/\n/g)];
    const line_number = lines.length;
    const character_index = (line_number > 0) ? index - (lines[line_number-1].index + 1) : index;
    return new vsc.Position(
        line_number,
        character_index
    );
}