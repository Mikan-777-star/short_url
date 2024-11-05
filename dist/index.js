"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const database_1 = require("./service/database");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const server = http_1.default.createServer((req, res) => {
    if (req.url === '/') {
        if (req.method === 'GET') {
            res.writeHead(300, { 'Location': '/public/index.html' });
            res.end();
        }
        else if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => body += chunk)
                .on('end', () => {
                try {
                    // JSONを解析
                    const data = JSON.parse(body);
                    (0, database_1.add_table)(data.originalUrl, data.password, (key, err) => {
                        if (err) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            console.log(err);
                            res.end(JSON.stringify({ success: false, message: err }));
                        }
                        else {
                            // レスポンスとして解析結果をJSONで返す
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: 'Data received', url: 'localhost:8080' + key }));
                        }
                    });
                }
                catch (error) {
                    console.error('Invalid JSON:', error);
                    // JSON解析エラー時のレスポンス
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Invalid JSON format' }));
                }
            });
        }
        else if (req.method === 'DELETE') {
        }
        else {
            res.writeHead(404, 'Not found');
            res.end("Not found");
        }
    }
    else if (req.url !== undefined && req.url.indexOf('public') > -1) {
        const filePath = path_1.default.join(__dirname, '..', req.url === '/public/' ? '/public/index.html' : req.url);
        const extname = path_1.default.extname(filePath);
        let contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
        }
        console.log(filePath);
        fs_1.default.readFile(filePath, (err, buf) => {
            if ((err === null || err === void 0 ? void 0 : err.code) === 'ENOENT') {
                res.writeHead(404);
                res.end('FILE NOT FOUND');
                return;
            }
            else {
                res.writeHead(200, { 'Content-type': contentType });
                res.end(buf);
            }
        });
    }
    else {
        if (req.url) {
            (0, database_1.getvalue)(req.url, (str, err) => {
                if (err) {
                    res.writeHead(404, 'Not found');
                    res.end("Not found");
                }
                else {
                    res.writeHead(301, { 'Location': str });
                    res.end();
                }
            });
        }
        else {
            res.writeHead(404, 'Not found');
            res.end("Not found");
        }
    }
});
server.listen(8080, 'localhost', () => {
    console.log("port8080　開放中");
});
