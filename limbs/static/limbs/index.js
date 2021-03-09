import {expand_popup} from '/static/shared/shared.js'

/**
 * Creates a popup for any item item.
 * @param {MouseEvent} e - The event that was triggered.
 * @param {string} path - The url path that is fetched to request popup data.
 */
window.item_popup = async function item_popup(e, path) {
    try {
        var response = await fetch(window.location.protocol + '//' + window.location.host + path, {
            headers: {
                'Accept': 'text/html',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        var popup = await expand_popup(e.target.parentNode, document.getElementById('item_tbl'));

        if (response.ok) {
            popup.classList.add('table_popup');
        }
        else {
            popup.classList.add('error_popup');
        }
        popup.innerHTML = await response.text();
    }
    catch (err) {
        console.error(err);
        return;
    }
}

/**
 * Creates a popup for any supplier item.
 * @param {MouseEvent} e - The event that was triggered.
 * @param {*} path - The url path that is fetched to request popup data.
 */
window.supplier_popup = async function supplier_popup(e, path) {
    try {
        var response = await fetch(window.location.protocol + '//' + window.location.host + path, {
            headers: {
                'Accept': 'text/html',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        var popup = await expand_popup(e.target.parentNode, document.getElementById('supplier_tbl'));

        if (response.ok) {
            popup.classList.add('supplier_popup');
        }
        else {
            popup.classList.add('error_popup');
        }
        popup.innerHTML = await response.text();
    }
    catch (err) {
        console.error(err);
        return;
    }
}

window.location_popup = async function location_popup(e, path) {

    try {
        var response = await fetch(window.location.protocol + '//' + window.location.host + path, {
            headers: {
                'Accept': 'text/html',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        var popup = await expand_popup(e.target.parentNode, document.getElementById('location_tbl'));
        if (response.ok) {
            popup.classList.add('location_popup');
        }
        else {
            popup.classList.add('error_popup');
        }
        popup.innerHTML = await response.text();
    }
    catch (err) {
        console.error(err);
        return;
    }
}

window.tag_popup = async function tag_popup(e, path) {

    try {
        var response = await fetch(window.location.protocol + '//' + window.location.host + path, {
            headers: {
                'Accept': 'text/html',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        var popup = await expand_popup(e.target.parentNode, document.getElementById('tag_tbl'));
        if (response.ok) {
            popup.classList.add('tag_popup');
        }
        else {
            popup.classList.add('error_popup');
        }
        popup.innerHTML = await response.text();
    }
    catch (err) {
        console.error(err);
        return;
    }
}

window.manufacturer_popup = async function manufacturer_popup(e, path) {

    try {
        var response = await fetch(window.location.protocol + '//' + window.location.host + path, {
            headers: {
                'Accept': 'text/html',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        var popup = await expand_popup(e.target.parentNode, document.getElementById('manufacturer_tbl'));
        if (response.ok) {
            popup.classList.add('manufacturer_popup');
        }
        else {
            popup.classList.add('error_popup');
        }
        popup.innerHTML = await response.text();
    }
    catch (err) {
        console.error(err);
        return;
    }
}

window.editData = function editData() {
    var form_name = "edit_item_form";
    var inputs_of_form = document.forms[form_name].getElementsByTagName("input");

    var elements = document.forms[form_name].elements;
    for (var i=0; i<elements.length; i++){
        //ignore this special input
        if (elements[i].name === "csrfmiddlewaretoken"){
            continue;
        }
        //remove readonly from input so user can edit
        if (elements[i].hasAttribute("readonly")){
            elements[i].removeAttribute("readonly");
        }
        //show save changes and delete buttons
        if (elements[i].hasAttribute("hidden")){
            elements[i].removeAttribute("hidden");
        }
      }
}

window.editSupplier = function editSupplier() {
    var form_name = "edit_supplier_form";
    var inputs_of_form = document.forms[form_name].getElementsByTagName("input");

    var elements = document.forms[form_name].elements;
    for (var i=0; i<elements.length; i++){
        //ignore this special input
        if (elements[i].name === "csrfmiddlewaretoken"){
            continue;
        }
        //remove readonly from input so user can edit
        if (elements[i].hasAttribute("readonly")){
            elements[i].removeAttribute("readonly");
        }
        //show save changes and delete buttons
        if (elements[i].hasAttribute("hidden")){
            elements[i].removeAttribute("hidden");
        }
      }
}

window.editLocation = function editLocation() {
    var form_name = "edit_location_form";
    console.log(document)
    var inputs_of_form = document.forms[form_name].getElementsByTagName("input");

    var elements = document.forms[form_name].elements;
    for (var i=0; i<elements.length; i++){
        //ignore this special input
        if (elements[i].name === "csrfmiddlewaretoken"){
            continue;
        }
        //remove readonly from input so user can edit
        if (elements[i].hasAttribute("readonly")){
            elements[i].removeAttribute("readonly");
        }
        //show save changes and delete buttons
        if (elements[i].hasAttribute("hidden")){
            elements[i].removeAttribute("hidden");
        }
      }
}

window.editTag = function editTag() {
    var form_name = "edit_tag_form";
    console.log(document)
    var inputs_of_form = document.forms[form_name].getElementsByTagName("input");

    var elements = document.forms[form_name].elements;
    for (var i=0; i<elements.length; i++){
        //ignore this special input
        if (elements[i].name === "csrfmiddlewaretoken"){
            continue;
        }
        //remove readonly from input so user can edit
        if (elements[i].hasAttribute("readonly")){
            elements[i].removeAttribute("readonly");
        }
        //show save changes and delete buttons
        if (elements[i].hasAttribute("hidden")){
            elements[i].removeAttribute("hidden");
        }
      }
}

window.editManufacturer = function editManufacturer() {
    var form_name = "edit_manufacturer_form";
    console.log(document)
    var inputs_of_form = document.forms[form_name].getElementsByTagName("input");

    var elements = document.forms[form_name].elements;
    for (var i=0; i<elements.length; i++){
        //ignore this special input
        if (elements[i].name === "csrfmiddlewaretoken"){
            continue;
        }
        //remove readonly from input so user can edit
        if (elements[i].hasAttribute("readonly")){
            elements[i].removeAttribute("readonly");
        }
        //show save changes and delete buttons
        if (elements[i].hasAttribute("hidden")){
            elements[i].removeAttribute("hidden");
        }
      }
}

window.deleteRowTable = function deleteRowTable(table_name, index){
    var table = document.getElementById(table_name);
    table.deleteRow(index);
}

window.addRowSupplier = function addRowSupplier(form_name) {

    var table = document.getElementById("supplier_table");
    var base_id = table.rows.length;

    // Create new row
    var row = table.insertRow(-1);

    //add columns
    var supplier = row.insertCell(0);
    var part_no = row.insertCell(1);
    var cost = row.insertCell(2);

    //need unique names to we can retrieve data from form
    var supp_name = "supplier_name_"+base_id;
    var partno_name = "supplier_partno_"+base_id;
    var link_name = "supplier_link_"+base_id;
    var cost_name = "supplier_cost_"+base_id;

    //button to remove
    var remove_but = `<button type="button" onclick="deleteRowTable('supplier_table', ${base_id})"> REMOVE </button>`;

    supplier.innerHTML = `<input id=supplier_row form="${form_name}" list="suppliers" type="text" name="${supp_name}">`;
    part_no.innerHTML = `<input id=supplier_row form="${form_name}" type="text" name="${partno_name}"> - <input form="${form_name}" type="url" name="${link_name}">`;
    cost.innerHTML = `<input id=supplier_row form="${form_name}" type="number" name="${cost_name}">` + remove_but; 
}

window.addRowLocation = function addRowLocation(form_name) {
  var table = document.getElementById("location_table");
  var base_id = table.rows.length;

  var row = table.insertRow(-1);
  var location = row.insertCell(0);
  var quantity = row.insertCell(1);

  var location_name = "location_name_"+base_id;
  var quantity_name = "location_quantity_"+base_id;

  //button to remove row 
  var remove_but = `<button type="button" onclick="deleteRowTable('location_table', ${base_id})"> REMOVE </button>`;

  location.innerHTML = `<input id=location_row form="${form_name}" list="locations" type="text" name="${location_name}">`;
  quantity.innerHTML = `<input id=location_row form="${form_name}" type="text" name="${quantity_name}">` + remove_but;
}


//window.onload = async function() {};

window.addRowTag = function addRowTag(form_name) {
    var table = document.getElementById("tag_table");
    var base_id = table.rows.length;

    var row = table.insertRow(-1);
    var tag = row.insertCell(0);

    var tag_name = "tag_name_"+base_id;

    var remove_but = `<button type="button" onclick="deleteRowTable('tag_table', ${base_id}"> REMOVE </button>`;

    tag.innerHTML = `<input id=tag_row form="${form_name}" list="tags" type="text" name="${tag_name}">` + remove_but;
}