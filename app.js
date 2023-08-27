const http = require('http');
const url = require('url');
const fs = require('fs');
const process = require('process');

const port = 3000;
const maxHistorySize = 20;
const historyFilePath = './history.json'; // File to store history data
const history = [];



// HISTORY
// Loading history data from the file at server start
try {
    const historyData = fs.readFileSync(historyFilePath);
    if (historyData) {
        history.push(...JSON.parse(historyData));
    }
} catch (error) {
    console.error('Error reading history file:', error);
}




// MAIN SERVER

const server = http.createServer(function (req, res) {

    // Getting the parsed URL
    const parsedUrl = url.parse(req.url, true);
    const pathSegments = parsedUrl.pathname.split('/');


    if (pathSegments[1] === 'history') {
        // Handling the /history endpoint
        res.writeHead(200, { 'Content-Type': 'text/html' });
        const historyList = history.map(entry => `Operation: ${entry.operation}, Result: ${entry.result}`).join('<br>');
        res.write(`Last 20 operations:${historyList}`);
        res.end();
    } else if (pathSegments.length >= 4 && pathSegments.length % 2 === 0) {

        // creating a result string type which will append all the operand and operator
        let result = "";
        result += parseFloat(pathSegments[1]);

        for (let i = 2; i < pathSegments.length; i += 2) {
            const operation = pathSegments[i].toLowerCase();
            const num = parseFloat(pathSegments[i + 1]);

            // switch cases for all the operators
            switch (operation) {
                case 'plus':
                    result += `+` + `${num}`;
                    break;
                case 'minus':
                    result += `-` + `${num}`;
                    break;
                case 'into':
                    result += `*` + `${num}`;
                    break;
                case 'divide':
                    if (num !== 0) {
                        result += `/` + `${num}`;
                    } else {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.write('Division by zero is not allowed');
                        res.end();
                        return;
                    }
                    break;

                // if above switch case are not there, the default value will shown invalid
                default:
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.write('Invalid operation');
                    res.end();
                    return;
            }
        }

        // evaluating the result mathematical expression and using eval() function to solve the expression using BODMAS rule.
        const evaluate = eval(result);

        // Adding the operation and result to the history
        history.unshift({ operation: result, result: evaluate });
        if (history.length > maxHistorySize) {
            history.pop();
        }

        // printing question and result
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`Question: ${result}   Result: ${evaluate}`);
        res.end();
    } else {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.write('Invalid URL format');
        res.end();
    }
});





// Listening for SIGINT and SIGTERM signals to save history before exiting
process.on('SIGINT', () => {
    console.log('Received SIGINT signal. Saving history and exiting...');
    saveHistoryAndExit();
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal. Saving history and exiting...');
    saveHistoryAndExit();
});

function saveHistoryAndExit() {
    try {
        fs.writeFileSync(historyFilePath, JSON.stringify(history), 'utf8');
        console.log('History saved successfully.');
    } catch (error) {
        console.error('Error writing history file:', error);
    }
    process.exit(0);
}



// Listening the server 
server.listen(port, function (error) {
    if (error) {
        console.log('Something went wrong', error);
    } else {
        console.log('Server is listening on port ' + port);
    }
});

