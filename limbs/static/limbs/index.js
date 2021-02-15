import {expand_popup} from '/static/shared/shared.js'

/**
 * Creates a popup
 * @param {MouseEvent} e - The event that was triggered
 * @param {string} path - The url path that is fetched to request popup data
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

window.deleteRowTable = function deleteRowTable(table_name, index){
    var table = document.getElementById(table_name);
    table.deleteRow(index);
}

window.validateForm = function validateForm(){

        
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

    //validate manufacturers 
    var manufacuturer_name = document.getElementsByName("manufacturer_name")[0].value.toLowerCase();
    var manufacuturer_names = document.getElementById("manufacturers").options;
    var manufacuturer_name_lst = []
    for (var i=0; i<manufacuturer_names.length; i++){
        manufacuturer_name_lst.push(manufacuturer_names[i].value.toLowerCase()); 
    }

    if (!manufacuturer_name_lst.includes(manufacuturer_name)){
        window.alert(manufacuturer_name + " is not a valid location");
        return false 
    }


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

    
    return true; // submit the form
     
     
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


// window.onload = async function() {};
