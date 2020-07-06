import {expand_popup} from './shared.js'

/**
 * Makes a request to perform a SQL query and returns a Promise which settles when the request completes/fails
 * @param {string} query - The SQL query to execute
 * @returns {Promise} A Promise which resolves to the returned data or rejects with returned status text
 */
async function exec_query(query) {  // I think I should abstract this out so SQL queries are only written on the server side
   var response = await fetch(window.location.protocol + '//' + window.location.host + '/query', {
       method: 'POST',
       body: query
   });
   if (!response.ok) {
       throw Error(response.status + ': ' + response.statusText);
   }
   else if (!(response.headers.get('Content-Type') === 'application/json')) {
       throw Error('Unexpected Server Response from Query');
   }
   return response.json();
}

/**
 * Retrieve data from the server out of a given table
 * At the moment I am unsure if this is the best way to do this
 * although I'd like to abstract out the SQL from the client somehow
 * @param {Array<string>} tables - The tables from which to pull the data
 * @param {Array<Array<string>>} fields - The fields to retrieve from each table
 * @param {Array<string>} conditions - I have no idea how to implement this
 * @returns {Promise<Array<Object>>} Resolves to the data returned from the server
 */
async function retrieve_data(tables, fields, conditions) {
    var response = await fetch(window.location.protocol + '//' + window.location.host + '/retrieve', {
        method: 'POST',
        body: JSON.stringify({
            table: tables,
            fields: fields
        })
    });
    if (!response.ok) {
        throw Error(response.status + ': ' + response.statusText);
    }
    else if (!(response.headers.get('Content-Type') === 'application/json')) {
        throw Error('Unexpected Server Response from Query');
    }
    return response.json();
}

/**
 * Submits data to the server for addition to the database.  Includes functionality for confimation
 * @param {string} table - The table where the data should be added
 * @param {Array<Object>} data - An array of objects to add
 * @returns {Promise} Resolves on submission completion.  Rejects if server errors
 */
async function submit_data(table, data) {
    var response = await fetch(window.location.protocol + '//' + window.location.host + '/submit', {
        method: 'POST',
        body: JSON.stringify({
            table: table,
            data: data
        })
    });
    if (response.status === 100) {
        // Need to implement confirm ('double check')
        var res = await response.json();
    } 
    if (response.status !== 200) {
        throw new Error('Submission Failed');
    }
}

/**
 * Submits a spreadsheet to the server for adding to the database
 * @param {File} file - The sheet to submit
 * @param {HTMLElement} response_el - The Element in which to put the response text
 * @param {HTMLDivElement} item_tbl_div - The div which contains the item table
 */
async function submit_sheet(file, response_el, item_tbl_div) {
    var wb = XLSX.read(await file.arrayBuffer(), {type: 'array'});
    var sheet = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    var response = await fetch(window.location.protocol + '//' + window.location.host + '/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            table: 'items',
            data: sheet
        })
    });
    var el = document.createElement('p');
    if (response.status === 100) {
        // Need to check if some objects were returned for double-checking
        // This might need to be a while loop
        throw new Error('Double Checking not implemented');
    }
    else if (response.ok) {
        el.innerText = 'Successfully Submitted Spreadsheet'
    }
    else {
        el.innerText = 'Submission Failed, ' + response.status + ': ' + response.statusText;
        el.style.color = '#CF6679';
    }
    response_el.appendChild(el);
    if (item_tbl_div.querySelector('table')) {
        item_tbl_div.removeChild(item_tbl_div.querySelector('table'));
    }
    item_tbl_div.appendChild(build_table(await exec_query('SELECT * FROM bdr_limbs.items'), 
                                                                        ['item_name', 'part_number', 'item_link'], 'item_id', item_popup));
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
    var qry = 'SELECT t.tag_name FROM bdr_limbs.tags as t JOIN bdr_limbs.item_tags as i_t ON t.tag_id = i_t.tag_id WHERE i_t.item_id = ' + data['item_id'];
    var tag_data = await exec_query(qry);
    var tag_string = tag_data.map((tag_obj) => {return tag_obj['tag_name']}).toString();
    tag_string = tag_string.substring(1, tag_string.length - 1);
    form.setAttribute('action', '');  // TO BE SET
    form.innerHTML = '<label for="tags"><h3 style="display: inline;">Tags: </h3></label><input inline" type="text" name="tags" value="' 
                                     + tag_string + '">';  // This should probably use a pattern attribute with a RegEx
    el = document.createElement('div');
    el.appendChild(form);
    popup.appendChild(el);

    el = document.createElement('div');
    qry = 'SELECT l.location_name, q.quantity FROM bdr_limbs.quantities as q JOIN bdr_limbs.locations as l ON q.location_id = l.location_id WHERE q.item_id = ' + data['item_id'];
    var loc_table = build_table(await exec_query(qry), ['location_name', 'quantity']);
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
            var popup = await expand_popup(this, document.getElementById('item_tbl'));

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
        var item_tbl_div = document.querySelector('#item_tbl');
        item_tbl_div.appendChild(build_table(await exec_query('SELECT * FROM bdr_limbs.items'), 
                                                                            ['item_name', 'part_number', 'item_link'], 'item_id', item_popup));
        document.querySelector('#sheet_submit_form').onsubmit = async function(event) {
            event.preventDefault();
            submit_sheet(event.target[0].files[0], this.parentElement, item_tbl_div);
        };
    }
    catch (err) {
        console.error(err);
    }
};