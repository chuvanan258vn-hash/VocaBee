
const fs = require('fs');
let content = fs.readFileSync('eslint_errors.json');
let str = content.toString('utf16le');
if (str.charCodeAt(0) === 0xFEFF) str = str.slice(1);
const data = JSON.parse(str);
data.forEach(file => {
    if (file.messages.some(msg => msg.severity === 2)) {
        console.log(`\nFile: ${file.filePath}`);
        let fileContent;
        try {
            fileContent = fs.readFileSync(file.filePath, 'utf8').split('\n');
        } catch(e) { 
            fileContent = [];
        }
        file.messages.filter(msg => msg.severity === 2).forEach(msg => {
            console.log(`  Line ${msg.line}: [${msg.ruleId}] ${msg.message}`);
            if (fileContent[msg.line - 1]) console.log(`    Content: ${fileContent[msg.line - 1].trim()}`);
        });
    }
});
