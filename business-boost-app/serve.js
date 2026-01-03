const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer((req, res) => {
    const filePath = req.url === '/' ? 'index.html' : req.url;
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200);
            res.end(content);
        }
    });
}).listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});