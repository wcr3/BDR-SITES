/**
 * Module of helper functions and constants for site routing
 * @module shared/router_lib
 */
var fs = require('fs');
var path = require('path');


 /** 
  * Collection of bit values corresponding to HTTP Request Methods 
  * @constant {Object.<string, number>}
  */
const HTTP_REQ_METHOD = module.exports.HTTP_REQ_METHOD = {
    'GET': 1<<0,
    'HEAD': 1<<1,
    'POST': 1<<2,
    'PUT': 1<<3,
    'DELETE': 1<<4,
    'CONNECT': 1<<5,
    'OPTIONS': 1<<6,
    'TRACE': 1<<7
};

/**
 * Collection of HTTP Content-Types (MIME Types) based on file extension
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types|MDN Web Docs}
 * @constant {Object.<string, string>}
 */
const HTTP_CONT_TYPE = module.exports.HTTP_CONT_TYPE = {
    '.html': 'text/html',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript',
    '.css': 'text/css'
};

/**
 * Writes success to the header of res and pipes f_stream to the client
 * @param {import('http').ServerResponse} res - The server response
 * @param {import('fs').ReadStream} f_stream - The ReadStream for the file to send
 * @param {string} cont_type - The HTTP content type of the file
 */
module.exports.send_success = function(res, f_stream, cont_type) {
    res.writeHead(200, {'Content-Type': cont_type});
    f_stream.pipe(res);
};

/**
 * Gets a ReadStream to the file at f_path
 * @param {string} f_path - The absolute path to the static file
 * @returns {?import('fs').ReadStream} A ReadStream for the given file, or null if it does not exist.
 */
module.exports.get_file = function(f_path) {
    var ret;
    try {
        fs.accessSync(f_path, fs.constants.R_OK);
        ret = fs.createReadStream(f_path);
    } catch (err) {
        console.log(err);
        ret = null;
    }
    return ret;
};