import {expand_popup} from '/static/shared/shared.js'

/**
 * Creates a popup for any item item.
 * @param {MouseEvent} e - The event that was triggered.
 * @param {string} path - The url path that is fetched to request popup data.
 */

window.do_popup = async function do_popup(e, path, table_id, table_class) {
    try {
        var response = await fetch(window.location.protocol + '//' + window.location.host + path, {
            headers: {
                'Accept': 'text/html',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        var popup = await expand_popup(e.target.parentNode, document.getElementById(table_id));

        if (response.ok) {
            popup.classList.add(table_class);
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

window.toggleDisplay = function toggleDisplay() {
  const paragraph = document.getElementsByClassName("paragraph");
  const tables = document.getElementsByClassName("table");
  const changes = document.getElementById("changes");
  const del = document.getElementById("delete");
  const edit_button = document.getElementById("edit");
  if(changes.hasAttribute("hidden") && del.hasAttribute("hidden")){
    changes.removeAttribute("hidden");
    del.removeAttribute("hidden");
  }
  else{
    changes.setAttribute("hidden",true);
    del.setAttribute("hidden",true);
  }
  //Its in the edit state
  if(edit_button.innerHTML.localeCompare("Edit") == 0){
    edit_button.innerHTML = "Display";
  }
  else{
    edit_button.innerHTML = "Edit";
  }
  for(var i = 0; i < paragraph.length; ++i){
    if(paragraph[i].style.display.localeCompare("none") == 0){
      paragraph[i].style.display = "block";
    }
    else{
      paragraph[i].style.display = "none";
    }
  }
  //Loop through tables
  for(var i = 0; i < tables.length; ++i){
    if(tables[i].style.display.localeCompare("block") == 0){
        tables[i].style.display = "none";
    }
    else{
        tables[i].style.display = "block";
    }
  }
}

window.editPressed = function editPressed(form_name){
    var elements = document.forms[form_name].elements;
    for (var i=0; i<elements.length; i++){
        //ignore this special input
        if (elements[i].name === "csrfmiddlewaretoken" || elements[i].id === "stayRead"){
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

// window.editData = function editData() {
//     var form_name = "edit_item_form";
//     var inputs_of_form = document.forms[form_name].getElementsByTagName("input");
//     var elements = document.forms[form_name].elements;
//     for (var i=0; i<elements.length; i++){
//         //ignore this special input
//         if (elements[i].name === "csrfmiddlewaretoken"){
//             continue;
//         }
//         //remove readonly from input so user can edit
//         if (elements[i].hasAttribute("readonly")){
//             elements[i].removeAttribute("readonly");
//         }
//         //show save changes and delete buttons
//         if (elements[i].hasAttribute("hidden")){
//             elements[i].removeAttribute("hidden");
//         }
//       }
// }

// window.editSupplier = function editSupplier() {
//     var form_name = "edit_supplier_form";
//     var inputs_of_form = document.forms[form_name].getElementsByTagName("input");

//     var elements = document.forms[form_name].elements;
//     for (var i=0; i<elements.length; i++){
//         //ignore this special input
//         if (elements[i].name === "csrfmiddlewaretoken"){
//             continue;
//         }
//         //remove readonly from input so user can edit
//         if (elements[i].hasAttribute("readonly")){
//             elements[i].removeAttribute("readonly");
//         }
//         //show save changes and delete buttons
//         if (elements[i].hasAttribute("hidden")){
//             elements[i].removeAttribute("hidden");
//         }
//       }
// }

// window.editLocation = function editLocation() {
//     var form_name = "edit_location_form";
//     console.log(document)
//     var inputs_of_form = document.forms[form_name].getElementsByTagName("input");

//     var elements = document.forms[form_name].elements;
//     for (var i=0; i<elements.length; i++){
//         //ignore this special input
//         if (elements[i].name === "csrfmiddlewaretoken"){
//             continue;
//         }
//         //remove readonly from input so user can edit
//         if (elements[i].hasAttribute("readonly")){
//             elements[i].removeAttribute("readonly");
//         }
//         //show save changes and delete buttons
//         if (elements[i].hasAttribute("hidden")){
//             elements[i].removeAttribute("hidden");
//         }
//       }
// }

// window.editTag = function editTag() {
//     var form_name = "edit_tag_form";
//     console.log(document)
//     var inputs_of_form = document.forms[form_name].getElementsByTagName("input");

//     var elements = document.forms[form_name].elements;
//     for (var i=0; i<elements.length; i++){
//         //ignore this special input
//         if (elements[i].name === "csrfmiddlewaretoken"){
//             continue;
//         }
//         //remove readonly from input so user can edit
//         if (elements[i].hasAttribute("readonly")){
//             elements[i].removeAttribute("readonly");
//         }
//         //show save changes and delete buttons
//         if (elements[i].hasAttribute("hidden")){
//             elements[i].removeAttribute("hidden");
//         }
//       }
// }

// window.editManufacturer = function editManufacturer() {
//     var form_name = "edit_manufacturer_form";
//     console.log(document)
//     var inputs_of_form = document.forms[form_name].getElementsByTagName("input");

//     var elements = document.forms[form_name].elements;
//     for (var i=0; i<elements.length; i++){
//         //ignore this special input
//         if (elements[i].name === "csrfmiddlewaretoken"){
//             continue;
//         }
//         //remove readonly from input so user can edit
//         if (elements[i].hasAttribute("readonly")){
//             elements[i].removeAttribute("readonly");
//         }
//         //show save changes and delete buttons
//         if (elements[i].hasAttribute("hidden")){
//             elements[i].removeAttribute("hidden");
//         }
//       }
// }

window.deleteRowTable = function deleteRowTable(table_name, index){
    var table = document.getElementById(table_name);
    table.deleteRow(index);
}

//function should not have same errors as the above one 
window.deleteRow = function deleteRow(rowid)  
{   
    var row = document.getElementById(rowid);
    row.parentNode.removeChild(row);
}

window.show_advanced_options = function show_advanced_options(){
    var advanced_search = document.getElementById("advanced_search");
    var gen_search = document.getElementById("general_search");
    var adv_search = document.getElementById("advanced_search_button")
    
    gen_search.value = ""
    if (advanced_search.style.display === "none") {
        advanced_search.style.display = "block";
        gen_search.style.display = "none";
        adv_search.textContent = "Basic Search"
      } else {
        advanced_search.style.display = "none";
        gen_search.style.display = "block";
        adv_search.textContent = "Show Advanced Options"
      }
}

window.validateForm = function validateForm(validate_supplier, validate_manufacturer, validate_location){

 

    if (validate_supplier) {
        
        //validate suppliers
        var supplier_row_names = document.querySelectorAll('[id=supplier_row_name]');
        var supplier_names = document.getElementById("suppliers").options;
        var supplier_name_lst = []
        for (var i=0; i<supplier_names.length; i++){
            supplier_name_lst.push(supplier_names[i].value.toLowerCase()); 
        }

        for (var i=0; i<supplier_row_names.length; i++){
            if (!supplier_name_lst.includes(supplier_row_names[i].value.toLowerCase())){
                window.alert(supplier_row_names[i].value+" is not a valid supplier");
                return false;
            }
        }

    }

    if (validate_manufacturer){


        //validate manufacturers 
        var manufacturer_row_names = document.querySelectorAll('[id=manufacturer_name]'); 
        var manufacturer_names = document.getElementById("manufacturers").options;
        var manufacturer_name_lst = [];
        for (var i=0; i<manufacturer_names.length; i++){
            manufacturer_name_lst.push(manufacturer_names[i].value.toLowerCase()); 
        }
        
        for (var i=0; i<manufacturer_row_names.length; i++){
            console.log(manufacturer_row_names[i].value.toLowerCase());
            if (!manufacturer_name_lst.includes(manufacturer_row_names[i].value.toLowerCase())){
                window.alert(manufacturer_row_names[i].value + " is not a valid manufacturer");
                return false;
            }
        }

    }

    if (validate_location){
    
        //validate locations 
        var location_row_names = document.querySelectorAll('[id=location_row_name]');
        var location_names = document.getElementById("locations").options;
        var location_name_lst = []
        var location_name_to_id = []
        for (var i=0; i<location_names.length; i++){
            location_name_lst.push(location_names[i].value.toLowerCase()); 
            location_name_to_id.push(location_names[i].getAttribute("data-id"));
        }

        for (var i=0; i<location_row_names.length; i++){
            if (!location_name_lst.includes(location_row_names[i].value.toLowerCase())){
                window.alert(location_row_names[i].value+" is not a valid location");
                return false;
            }
        }

        //override values to be ids for location  
        var container = document.getElementById("hidden_container");
        for (var i=0; i < location_row_names.length; i++){
            var index = location_name_lst.indexOf(location_row_names[i].value.toLowerCase())
            var corresponding_id = location_name_to_id[index];
            
            //make a hidden node 
            var hidden_input = location_row_names[i].cloneNode( true );
            hidden_input.style.display = "none";
            hidden_input.value = corresponding_id
            hidden_input.name = "id_" + hidden_input.name
            container.appendChild(hidden_input);
        }

    }
    
    return true; // submit the form
     
     
}

window.addElem = function addElem(id_of_input, container, data_list){

    var container = document.getElementById(container);
    var input_field = document.getElementById(id_of_input);
    var num_children = container.children.length/2;

    var datalist_options = document.getElementById(data_list).options;
    var obj_id = -1 
    for (var i=0; i<datalist_options.length; i++){
        if (datalist_options[i].value.toLowerCase() === input_field.value.toLowerCase()){
            obj_id = datalist_options[i].getAttribute("data-id");
            break; 
        }
    }

    if (obj_id == -1){
        window.alert("Poor choice of " + data_list);
        return; 
    }

    var hidden_input = document.createElement("INPUT");
    hidden_input.setAttribute("type", "text");
    hidden_input.style.display = "none";
    hidden_input.value = obj_id
    hidden_input.name = `${id_of_input}_${num_children}`

    var btn = document.createElement("BUTTON");   // Create a <button> element
    btn.innerHTML = input_field.value+"-";
    btn.onclick = function() {
        hidden_input.remove();
        btn.remove(); 
    }

    input_field.value = "";
    container.appendChild(btn);
    container.appendChild(hidden_input);

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

    supplier.innerHTML = `<input required id=supplier_row_name form="${form_name}" list="suppliers" type="text" name="${supp_name}">`;
    part_no.innerHTML = `<input required id=supplier_row form="${form_name}" type="text" name="${partno_name}"> - <input required form="${form_name}" type="url" name="${link_name}">`;
    cost.innerHTML = `<input required id=supplier_row form="${form_name}" type="number" name="${cost_name}">` + remove_but; 
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

  location.innerHTML = `<input required id=location_row_name form="${form_name}" list="locations" type="text" name="${location_name}">`;
  quantity.innerHTML = `<input required id=location_row form="${form_name}" type="text" name="${quantity_name}">` + remove_but;
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
