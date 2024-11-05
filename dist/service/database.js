"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add_table = add_table;
exports.remove_table = remove_table;
exports.getvalue = getvalue;
const mysql_1 = __importDefault(require("mysql"));
const crypto_1 = __importDefault(require("crypto"));
const sql_login_json_1 = __importDefault(require("../data/sql_login.json"));
const connection = mysql_1.default.createConnection(sql_login_json_1.default);
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS SHORTURL_TABLE(
        id INTEGER AUTO_INCREMENT PRIMARY KEY,
        \`key\` CHAR(10) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        password VARCHAR(512) NOT NULL,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_value (value(255))
    )
`;
connection.connect((err) => {
    if (err) {
        console.error("Error connecting to the database: " + err.stack);
        return;
    }
    console.log('connected to database');
    connection.query(createTableQuery, (err, result) => {
        if (err) {
            console.error('error creating table: ', err.stack);
            return;
        }
        console.log('Table created successfully');
    });
});
function makeRandomStr(size) {
    const randomStr = "1234567890qwertyuiopasdfghjkl-_/?!@[]xcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
    var ans = '';
    for (let i = 0; i < size; i++) {
        ans += randomStr[Math.floor(Math.random() * randomStr.length)];
    }
    return ans;
}
function generateSHA256Hash(input) {
    return crypto_1.default.createHash('sha256').update(input, 'utf8').digest('hex');
}
function add_table(value, passoword, next) {
    const sql = 'INSERT INTO SHORTURL_TABLE(\`key\`, value, password) values  (?,?,?);';
    const key = '/' + makeRandomStr(9);
    connection.query(sql, [key, value, passoword], (err, result) => {
        if (err) {
            console.error('インサートのエラー');
            next('', err);
            return;
        }
        console.log('データが挿入されました');
        next(key);
    });
}
function remove_table(key, password, next) {
    const sql = "DELETE FROM SHORTURL_TABLE WHERE \`key\` = ? AND password = ?";
    connection.query(sql, [key, generateSHA256Hash(password)], (err, result) => {
        if (err) {
            console.error('デリートのエラー');
            next(err);
            return;
        }
        console.log('データが削除されました');
        next();
        return;
    });
}
function getvalue(key, next) {
    const sql = "SELECT value FROM SHORTURL_TABLE WHERE \`key\` = ?";
    connection.query(sql, key, (err, result) => {
        if (err || result.length == 0) {
            console.error('query error');
            next('', err ? err : new Error('存在しねー'));
            return;
        }
        next(result[0].value);
    });
}
