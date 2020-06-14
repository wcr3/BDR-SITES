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
 * Builds a table and returns the table element
 * @param {Array.<Object>} objs - The data to put on the table
 * @param {Array.<string>} keys - An array of keys corresponding to the columns of the table
 * @param {string} [id_key] - The key associated with a callback for each table row
 * @param {function} [callback] - The callback for generating onclick events for table rows
 * @return The table Element
 */
function build_table(objs, keys, id_key, callback) {
    var table = document.createElement('table');
    var row = document.createElement('tr');;
    var cell;
    keys.forEach((key) => {
        cell = document.createElement('th');
        cell.style.textTransform = 'capitalize';
        cell.innerHTML = key.replace(/_/g, ' ');
        row.appendChild(cell);
    });
    table.appendChild(row);
    objs.forEach((obj) => {
        row = document.createElement('tr');
        if (id_key && callback) {
            row.onclick = callback(obj[id_key]);
        }
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
 * Builds the item popup
 * @param {Object} data - The item data from the server
 * @param {HTMLElement} popup - The popup element in which to build the info
 */
async function build_popup(data, popup) {
    popup.classList.add('table_popup');
    var header = document.createElement('div');
    header.style.gridColumn = 'span 2';
    var el = document.createElement('h1');
    el.innerHTML = data['item_name'];
    header.appendChild(el);
    el = document.createElement('h2');
    el.innerHTML = data['part_number'];
    if (data['item_link']) {
        var new_el = document.createElement('a');
        new_el.setAttribute('href', data['item_link']);
        new_el.setAttribute('target', '_blank');
        new_el.appendChild(el);
        el = new_el;                
    }
    header.appendChild(el);
    popup.append(header);

    var form = document.createElement('form');
    var tag_data = await exec_query('SELECT t.tag_name FROM bdr_limbs.tags as t \
                                     JOIN bdr_limbs.item_tags as i_t ON t.tag_id = i_t.tag_id \
                                     WHERE i_t.item_id = ' + data['item_id']);
    var tag_string = tag_data.map((tag_obj) => {return tag_obj['tag_name']}).toString();
    tag_string = tag_string.substring(1, tag_string.length - 1);
    form.setAttribute('action', '');  // TO BE SET
    form.innerHTML = '<label for="tags"><h3 style="display: inline;">Tags: </h3></label><input inline" type="text" name="tags" value="' 
                                     + tag_string + '">';  // This should probably use a pattern attribute with a RegEx
    el = document.createElement('div');
    el.appendChild(form);
    popup.appendChild(el);

    el = document.createElement('div');
    var loc_table = build_table(await exec_query('SELECT l.location_name, q.quantity FROM bdr_limbs.quantities as q \
                                                  JOIN bdr_limbs.locations as l ON q.location_id = l.location_id \
                                                  WHERE q.item_id = ' + data['item_id']), 
                                                                                        ['location_name', 'quantity']);
    loc_table.classList.add('loc_table');
    el.appendChild(loc_table);
    el.style.gridRow = 'span 2';
    popup.appendChild(el);

    el = document.createElement('div');
    el.innerHTML = 'Grid Element 3';
    popup.appendChild(el);
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

            if (data.length > 1 || data.length == 0) {
                popup.classList.add('error_popup')
                var el = document.createElement('h1');
                el.innerHTML = data.length > 1 ? 'Item ID not Unique' : 'Item ID not Found.';
                popup.appendChild(el);
            }
            else {
                build_popup(data[0], popup);
            }
        }
        catch (err) {
            console.error(err);
            return;
        }
    };
}

window.onload = async function() {
    try {
        document.getElementById('item_tbl').appendChild(build_table(await exec_query('SELECT * FROM bdr_limbs.items'), 
                                                                            ['item_name', 'part_number', 'item_link'], 'item_id', item_popup));
    }
    catch (err) {
        console.error(err);
    }
};