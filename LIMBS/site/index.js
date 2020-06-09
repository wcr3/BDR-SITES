import {make_modal} from './shared.js'

/**
 * Makes a request to perform a SQL query and returns a Promise which settles when the request completes/fails
 * @param {string} query - The SQL query to execute
 * @returns {Promise} A Promise which resolves to the returned data or rejects with returned status text
 */
function exec_query(query) {
    return new Promise((resolve, reject) => {
        var sql_req = new XMLHttpRequest();
        sql_req.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status === 200 && this.getResponseHeader('Content-Type') === 'application/json') {
                    resolve(JSON.parse(this.responseText));
                } 
                else {
                    reject(Error(this.statusText));
                }
            }
        };
        sql_req.open('GET', window.location.protocol + '//' + window.location.host + '/query?query=' + encodeURIComponent(query));
        sql_req.send();
    });
}

/**
 * Builds a table of items and sets it as a child to the given <div>
 * @param {Array.<Object>} objs - The data to put on the table
 * @param {string} id - The id of the <div>
 * @param {Array.<string>} keys - An array of keys corresponding to the columns of the table
 */
function build_item_table(objs, id, keys) {
    var table = document.createElement('table');
    var row = document.createElement('tr');;
    var cell;
    keys.forEach((key) => {
        cell = document.createElement('th');
        cell.innerHTML = key;
        row.appendChild(cell);
    });
    table.appendChild(row);
    objs.forEach((obj) => {
        row = document.createElement('tr');
        row.onclick = item_modal(obj.item_id);
        keys.forEach((key) => {
            cell = document.createElement('td');
            cell.innerHTML = obj.key;
            row.appendChild(cell);
        });
        table.appendChild(row);
    });
    document.getElementById(id).appendChild(table);
}

/**
 * Generates a callback function to create a modal popup with info about the item with the given id
 * @param {number} id - The item_id of the item to report
 * @returns {function} The callback function to generate the modal
 */
function item_modal(id) {
    return async function() {
        try {
            var data = await exec_query('SELECT * FROM bdr_limbs.items WHERE item_id = ' + id);
            var modal = make_modal('');
            var el = document.createElement('h1');
            el.innerHTML = data.item_name;
            modal.appendChild(el);
            el = document.createElement('h2');
            el.innerHTML = data.part_number; 
            modal.appendChild(el);
        }
        catch (err) {
            console.error(err);
            return;
        }
    };
}

window.onload = async function() {
    try {
        build_item_table(await exec_query('SELECT * FROM bdr_limbs.items'), 'item_tbl', ['item_name', 'part_number', 'item_link']);
    }
    catch (err) {
        console.error(err);
    }
};