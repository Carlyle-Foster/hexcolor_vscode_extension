import * as vsc from 'vscode';

const COLOR_REGEX = /0x[0-9a-f]{6}[0-9a-f]{2}?/g;

export function activate(_context) {
    for (const language of ['sql']) {
        vsc.languages.registerColorProvider(
            { language }, 
            {
                provideDocumentColors,
                provideColorPresentations,
            }
        ); 
    }
}

function provideDocumentColors(document, _token) {
    COLOR_REGEX.lastIndex = 0;
    
    return document.getText().matchAll(COLOR_REGEX).map( (match) => {
        const start = document.positionAt(match.index);
        const end   = document.positionAt(match.index + match[0].length);
        
        const range = new vsc.Range(start, end);
        const color = readHexColor(match[0]);

        return new vsc.ColorInformation(range, color);
    });
}

function provideColorPresentations(color, _context, _token) {
    const hex_color = writeHexColor(color);
    return [ new vsc.ColorPresentation(hex_color) ];
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