const http = require('http');
const url = require('url');


const port = 3000;

const server = http.createServer(function(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathSegments = parsedUrl.pathname.split('/'); // Split the path into segments

    if (pathSegments.length >= 4 && pathSegments.length % 2 === 0) {
        
        let result = "";
        result += parseFloat(pathSegments[1]);

        for (let i = 2; i < pathSegments.length; i += 2) {
            const operation = pathSegments[i].toLowerCase();
            const num = parseFloat(pathSegments[i + 1]);

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
                default:
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.write('Invalid operation');
                    res.end();
                    return;
            }
        }

        const evaluate = eval(result);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`Question: ${result}   Result: ${evaluate}`);
        res.end();
    } else {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.write('Invalid URL format');
        res.end();
    }
});

server.listen(port, function(error) {
    if (error) {
        console.log('Something went wrong', error);
    } else {
        console.log('Server is listening on port ' + port);
    }
});


