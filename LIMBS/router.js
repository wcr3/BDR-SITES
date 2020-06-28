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

var db_connection = null;
/**
 * Connects to the MySQL database
 * @returns {Promise<import('mysql').Connection>} Resolves to the MySQL Connection
 */
function db_connect() {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password" // I am a master of security
    });
    return new Promise((resolve, reject) => {
        con.connect(function(err) {
            if (err) {
                console.error(err);
                reject(new Error('500 Failed to create SQL Connection.'));
            }
            else {
                resolve(con);
            }
        });
    });
}

/**
 * A Promise-based wrapper for sql queries
 * @param {import('mysql').Connection} con - The Database connection
 * @param {string} q - The query string
 * @returns {Promise<Array<Object>>} A promise which resolves to the results of the query
 */
function async_query(con, q) {
    if (!q || q === '') {
        return Promise.reject(new Error('400 No SQL query supplied.'));
    }
    return new Promise((resolve, reject) => {
        con.query(q, (err, results) => {
            if (err) {
                console.error(err);
                reject (new Error('500 SQL query failed.'))
            }
            else {
                resolve(results);
            }
        });
    });
}

/**
 * A function to handle routing for LIMBS
 * @param {import('http').IncomingMessage} req - The request made to the server
 * @param {import('http').ServerResponse} res - The server response
 * @returns {Promise} Resolves on a successful route.  Rejects otherwise.
 */
module.exports = async function(req, res) {
    var req_url = new URL(req.url, 'http://' + req.headers.host);
    if (req_url.pathname === '/') {
        var index_file = await router_lib.get_file(path.join(__dirname, 'site', 'index.html'));
        await router_lib.send_success(await router_lib.read_file(index_file), router_lib.HTTP_CONT_TYPE['.html'], res);
        index_file.close();
        return;
    }
    else if ((req_url.pathname.split('/')[1]) === 'query') {
        if (!db_connection) {
            db_connection = await db_connect();
        }
        var q;
        if (req.method === 'POST') {
            q = await router_lib.stream_to_string(req);
        }
        else if (req.method === 'GET') {
            q = querystring.parse(req_url.search.slice(1)).query;
        }
        await router_lib.send_success(JSON.stringify(await async_query(db_connection, q)), router_lib.HTTP_CONT_TYPE['.json'], res);
        return;
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
                    var results = await async_query(db_connection, 'SELECT * FROM bdr_limbs.items WHERE item_name = \'' + item_data['name'] + '\'');
                    if (results.length > 0) {
                        to_check.push(item_data);
                        return;
                    }
                    var supplier = await async_query(db_connection, 'SELECT supplier_id FROM bdr_limbs.suppliers WHERE supplier_name = \'' + item_data['supplier'] + '\'');
                    if (supplier.length > 1 || supplier.length == 0) {
                        var err = supplier.length > 1 ? new Error('Supplier ' + item_data['supplier'] + ' is not unique') : new Error('No supplier with name ' + item_data['supplier']);
                        throw err;
                    }
                    await async_query(db_connection, 'INSERT INTO bdr_limbs.items (item_name, supplier_id, part_number, item_link) VALUES ( \'' + item_data['name'] + '\', ' + supplier[0] + ', \'' + item_data['number'] + '\', \'' + item_data['link'] + '\')');
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
        return;
    }
    else if (path.extname(req_url.pathname) !== '') {
        var file;
        try {
            file = await router_lib.get_file(path.join(__dirname, 'site', req_url.pathname));
        } catch (err) {
            file = await router_lib.get_file(path.resolve(path.join(__dirname, '..', 'shared', 'assets', req_url.pathname)));
        }
        await router_lib.send_success(await router_lib.read_file(file), router_lib.HTTP_CONT_TYPE[path.extname(req_url.pathname)], res);
        file.close();
        return;
    }
    throw new Error('404 LIMBS failed to route.');
};