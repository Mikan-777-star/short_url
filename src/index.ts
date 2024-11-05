import http from 'http'
import {add_table, remove_table, getvalue} from './service/database'
import fs from 'fs'
import path from 'path'

interface request {
    originalUrl :string,
    password : string
}


const server = http.createServer((req, res)=>{
    if(req.url === '/'){
        if(req.method === 'GET'){
            res.writeHead(300, {'Location': '/public/index.html'});
            res.end();
        }else if(req.method === 'POST'){
            let body = '';
            req.on('data',(chunk) => body += chunk)
            .on('end', ()=>{
                try {
                    // JSONを解析
                    const data: request = JSON.parse(body);
                    
                    add_table(data.originalUrl, data.password, (key, err)=>{
                        if(err){
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            console.log(err);
                            res.end(JSON.stringify({success:false, message : err }));
                        }else{
                            // レスポンスとして解析結果をJSONで返す
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({success: true ,message: 'Data received', url : 'localhost:8080' + key }));
                        }
                    })
                } catch (error) {
                    console.error('Invalid JSON:', error);
    
                    // JSON解析エラー時のレスポンス
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({success:false, message : 'Invalid JSON format' }));
                }
            })
            
        }else if(req.method === 'DELETE'){

        }else{
            res.writeHead(404, 'Not found');
            res.end("Not found");
        }
    } else if(req.url !== undefined && req.url.indexOf('public') > -1){
        const filePath = path.join(__dirname, '..' , req.url === '/public/'? '/public/index.html' : req.url);
        const extname = path.extname(filePath);
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
        fs.readFile(filePath,(err,buf)=>{
            if(err?.code === 'ENOENT'){
                res.writeHead(404);
                res.end('FILE NOT FOUND');
                return;
            }else{
                res.writeHead(200, {'Content-type': contentType})
                res.end(buf);
            }
        }) 
    }else{
        if (req.url){
            getvalue(req.url, (str, err)=>{
                if(err){
                    res.writeHead(404, 'Not found');
                    res.end("Not found");
                }else{
                    res.writeHead(301, {'Location': str});
                    res.end();
                }
            });
        }else{
            res.writeHead(404, 'Not found');
            res.end("Not found");
        }
    } 
})
server.listen(8080, 'localhost',()=>{
    console.log("port8080　開放中");
})