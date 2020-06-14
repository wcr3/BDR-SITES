import {expand_popup} from './shared.js'

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
 * Builds a table of items and returns the table element
 * @param {Array.<Object>} objs - The data to put on the table
 * @param {Array.<string>} keys - An array of keys corresponding to the columns of the table
 * @return The table Element
 */
function build_item_table(objs, keys) {
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
        row.onclick = item_popup(obj.item_id);
        keys.forEach((key) => {
            cell = document.createElement('td');
            cell.innerHTML = obj[key];
            row.appendChild(cell);
        });
        table.appendChild(row);
    });
    return table;
}

/**
 * Generates a callback function to create a popup with info about the item with the given id
 * @param {number} id - The item_id of the item to report
 * @returns {function} The callback function to generate the popup
 */
function item_popup(id) {
    return async function() {
        try {
            var data = await exec_query('SELECT * FROM bdr_limbs.items WHERE item_id = ' + id);
            var popup = expand_popup(this, document.getElementById('item_tbl'));
            popup.classList.add('table_popup');
            var el = document.createElement('h1');
            el.innerHTML = data[0]['item_name'];
            popup.appendChild(el);
            el = document.createElement('h2');
            el.innerHTML = data[0]['part_number'];
            if (data[0]['item_link']) {
                var new_el = document.createElement('a');
                new_el.setAttribute('href', data[0]['item_link']);
                new_el.setAttribute('target', '_blank');
                new_el.appendChild(el);
                el = new_el;                
            }
            popup.appendChild(el);
        }
        catch (err) {
            console.error(err);
            return;
        }
    };
}

window.onload = async function() {
    try {
        document.getElementById('item_tbl').appendChild(build_item_table(await exec_query('SELECT * FROM bdr_limbs.items'), ['item_name', 'part_number', 'item_link']));
    }
    catch (err) {
        console.error(err);
    }
};