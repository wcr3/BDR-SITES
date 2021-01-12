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

//window.onload = async function() {};