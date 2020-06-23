/** 
 * Routing Module for LIMBS to be used with the modular routing system
 * @module limbs_router
 */
var path = require('path');
var querystring = require('querystring');

var mysql = require('../shared/node_modules/mysql');
var xlsx = require('../shared/node_modules/xlsx');
var formidable = require('../shared/node_modules/formidable');

var router_lib = require('../shared/router_lib');
const { read } = require('fs');

var db_connected = false;
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password" // I am a master of security
});
con.connect(function(err) {
    if (err) {
        console.error(err);
    }
    else {
        db_connected = true;
    }
});

/**
 * A Promise-based wrapper for sql queries
 * @param {string} q - The query string
 * @returns {Promise} A promise with resolves to the results of the query
 */
function async_query(q) {
    return new Promise((resolve, reject) => {
        con.query(q, (err, results) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(results);
            }
        });
    });
}

/**
 * Performs a SQL Query and send the results as JSON to the given response
 * @param {string} q - The SQL query to perform
 * @param {import('http').ServerResponse} res - The response to which the JSON should be sent
 */
async function sql_send_json(q, res) {
    try {
        var results = await async_query(q);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(results));
    } catch (err) {
        console.error(err);
        res.writeHead(500, "SQL Query Failed.");
        res.end();
    }
}

/**
 * A function to handle routing for LIMBS
 * @param {import('http').IncomingMessage} req - The request made to the server
 * @param {import('http').ServerResponse} res - The server response
 * @returns {boolean} Whether the response was completed
 */
module.exports = function(req, res) {
    var f_stream;
    var req_url = new URL(req.url, 'http://' + req.headers.host);
    if (req_url.pathname === '/') {
        if (f_stream = router_lib.get_file(path.join(__dirname, 'site', 'index.html'))) {
            router_lib.send_success(res, f_stream, router_lib.HTTP_CONT_TYPE['.html']);
            return true;
        }
    }
    else if ((req_url.pathname.split('/')[1]) === 'query') {
        if (!db_connected) {
            res.writeHead(500, "SQL Database not connected.");
            res.end();
            return true;
        }
        if (req.method === 'POST') {
            router_lib.stream_to_string(req).then((q) => {sql_send_json(q, res)});
        }
        else if (req.method === 'GET') {
            var q = querystring.parse(req_url.search.slice(1)).query;
            if (!q) {
                res.writeHead(400, "No SQL query supplied");
                res.end();
                return true;
            }
            sql_send_json(q, res);
        }
        return true;
    }
    else if ((req_url.pathname.split('/')[1]) === 'submit') {  // Need to implement item and supplier submission
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            var wb_file = files[Object.keys(files)[0]];
            var wb = xlsx.readFile(wb_file.path);
            var sheet = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            var to_check = [];
            sheet.forEach(async (item_data) => {
                try {
                    var results = await async_query('SELECT * FROM bdr_limbs.items WHERE item_name = \'' + item_data['name'] + '\'');
                    if (results.length > 0) {
                        to_check.push(item_data);
                        return;
                    }
                    var supplier = await async_query('SELECT supplier_id FROM bdr_limbs.suppliers WHERE supplier_name = \'' + item_data['supplier'] + '\'');
                    if (supplier.length > 1 || supplier.length == 0) {
                        var err = supplier.length > 1 ? new Error('Supplier ' + item_data['supplier'] + ' is not unique') : new Error('No supplier with name ' + item_data['supplier']);
                        throw err;
                    }
                    await async_query('INSERT INTO bdr_limbs.items (item_name, supplier_id, part_number, item_link) VALUES ( \'' + item_data['name'] + '\', ' + supplier[0] + ', \'' + item_data['number'] + '\', \'' + item_data['link'] + '\')');
                }
                catch (err) {
                    console.error(err);
                    var check;
                    check = Object.assign(item_data, check);
                    check.error = err;
                    to_check.push(check);
                }
            });
            if (to_check.length > 0) {
                res.writeHead(100, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(to_check));
            }
            else {
                res.writeHead(200);
                res.end();
            }
        });
        return true;
    }
    else if (path.extname(req_url.pathname) !== '') {
        if ((f_stream = router_lib.get_file(path.join(__dirname, 'site', req_url.pathname))) || 
                (f_stream = router_lib.get_file(path.resolve(path.join(__dirname, '..', 'shared', 'assets', req_url.pathname))))) {
            router_lib.send_success(res, f_stream, router_lib.HTTP_CONT_TYPE[path.extname(req_url.pathname)]);
            return true;
        }
    }
    return false;
};