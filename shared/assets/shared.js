/**
 * Module of shared functions for client-side sites
 * @module shared
 */

/**
 * Builds a header bar with links to each site
 * @returns The html text for the header.
 */
export function build_header() {
    // Not sure if I should send an XMLHttpRequest for an html page (header.html or something) or just build the text here manually
};

/**
 * Makes a modal popup window on the page with the given html internals.  The class of the modal is 'modal'
 * @param innerHtml - The inner html for the modal box
 * @returns The modal element created
 */
export function make_modal(innerHtml) {
    var background = document.createElement('div');
    background.className = 'modal_background';
    var modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = '_' + Math.random().toString(36).substr(2,9);
    modal.innerHTML = innerHtml;
    background.appendChild(modal);
    document.body.appendChild(background);
    var onclick_func = window.onclick;
    window.onclick = function(event) {
        if (onclick_func) {
            onclick_func(event);
        }
        if (event.target === background) {
            document.body.removeChild(background);
        }
    }
    return modal;
};