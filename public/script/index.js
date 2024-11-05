'use strict'

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // フォームのデフォルト送信を防ぐ

    // フォームデータの取得
    const originalUrl = document.getElementById('url').value;
    const password = document.getElementById('password').value;

    // データをコンソールに表示（ここで実際の処理を行うことができる）
    fetch('/',{
        'method': 'POST',
        'Content-type': 'application/json',
        'body':JSON.stringify({
            originalUrl :originalUrl,
            password : password
        })
    })
    .then(resp => {
        if(resp.ok){
            return resp.json();
        }else{
            throw new Error("エラー:"+resp.json().message);
        }
    })
    .then(data => {
        if(data.success){
            document.getElementById('result').innerHTML = "短縮URL→"+ data.url ;
        }else{
            throw new Error("エラー"+data.message);
        }
    })
    .catch(err=>{
        console.error(err);
    })
});