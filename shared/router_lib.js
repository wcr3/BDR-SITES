/**
 * Module of helper functions and constants for site routing
 * @module shared/router_lib
 */
var fs_promises = require('fs').promises;

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
    '.css': 'text/css',
    '.json': 'application/json'
};

/**
 * Writes success to the header of res and writes file to the client
 * @param {string | number[]} data - The data to be sent
 * @param {string} cont_type - The HTTP content type of the file
 * @param {import('http').ServerResponse} res - The server response
 * @returns {Promise<any>} Resolves on a successful send.  Rejects otherwise.
 */
module.exports.send_success = async function(data, cont_type, res) {
    res.writeHead(200, {'Content-Type': cont_type});
    res.end(data);
};

/**
 * Reads a given file handle and returns the contents
 * @param {import('fs').promises.FileHandle} file - The FileHandle for the file to be read
 * @returns {Promise<Buffer>} Resolves to the data read from the file.  Rejects otherwise.
 */
module.exports.read_file = async function(file) {
    try {
        return await file.readFile();
    } catch (err) {
        console.error(err);
        throw new Error('500 Failed to read file at descriptor: ' + file.fd + '.');
    }
}

/**
 * Gets a FileHandle to the file at f_path.  Rejects otherwise.
 * @param {string} f_path - The absolute path to the static file
 * @returns {Promise<import('fs').promises.FileHandle>} Reolves to a FileHandle for the given file or rejects if it does not exist
 */
module.exports.get_file = async function(f_path) {
   try {
       return await fs_promises.open(f_path, 'r');
   }
   catch (err) {
       console.error(err);
       throw new Error('500 failed to open file');
   }
};

/**
 * Writes a stream into a string via a promise that resolves upon stream end
 * @param {import('stream').Readable} stream - The stream to read from
 * @returns {Promise<string>} The promise that resolves to the string
 */
module.exports.stream_to_string = function(stream) {
    var chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {chunks.push(chunk)});
        stream.on('error', reject);
        stream.on('end', () => {resolve(Buffer.concat(chunks).toString('utf8'))});
    });
}