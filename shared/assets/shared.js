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
 * A helper function for asynchronous waiting for things like animations and transitions
 * @param {number} ms - The time to wait
 * @returns A promise that resolves when the wait is complete
 */
function async_timeout(ms) {
    return new Promise((resolve => {
        setTimeout(resolve, ms);
    }));
}

/**
 * Makes a modal popup window on the page.  It has class 'modal'
 * @returns The modal Element created
 */
export function make_modal() {
    var background = document.createElement('div');
    background.className = 'modal_background';
    var modal = document.createElement('div');
    modal.className = 'modal';
    background.appendChild(modal);
    document.body.appendChild(background);
    var onclick_func = window.onclick;
    window.onclick = function(event) {
        if (onclick_func) {
            onclick_func(event);
        }
        if (event.target === background) {
            document.body.removeChild(background);
            window.onclick = onclick_func;
        }
    }
    return modal;
};

/**
 * Expands a popup window from the location of source to cover parent
 * @param {HTMLElement} source - The source element for the popup, defining it's initial box
 * @param {HTMLElement} parent - The parent, defining the space it grows to cover
 * @returns {HTMLElement} The popup Element created
 */
export function expand_popup(source, parent) {
    var background = document.createElement('div');
    background.className = 'popup_background';
    var popup = document.createElement('div');
    popup.className = 'popup';
    var popup_contents = document.createElement('div');

    var rect = source.getBoundingClientRect();
    var parent_rect = parent.getBoundingClientRect();
    var top = window.getComputedStyle(parent).position !== 'static' ? (rect.top + window.scrollY - parent_rect.top) : (rect.top + window.scrollY);
    var left = window.getComputedStyle(parent).position !== 'static' ? (rect.left + window.scrollX - parent_rect.left) : (rect.left + window.scrollX);
    var border = window.getComputedStyle(source).borderRadius;
    popup.style.cssText = '--source_width: ' + rect.width + 'px; --source_height: ' + rect.height + 'px; --source_top: ' + top + 'px; --source_left: ' + left + 'px; --source-br: ' + border + ';';
    
    background.appendChild(popup);
    parent.appendChild(background);

    var onclick_func = parent.onclick;
    parent.onclick = function(event) {
        if (onclick_func) {
            onclick_func(event);
        }
        if (event.target === background) {
            popup.style.minHeight = null;
            popup.style.height = null;
            popup.removeChild(popup_contents);
            popup.ontransitionend = (event) => {
                if (event.propertyName === 'box-shadow') {
                    parent.removeChild(background);
                    parent.onclick = onclick_func;
                }
            };
            async_timeout(100).then(() => {popup.classList.remove('expand')});
        }
    };

    popup.ontransitionend = (event) => {
        if (event.propertyName === 'width') {
            popup.style.minHeight = '90%';
            popup.style.height = 'auto';
            popup.appendChild(popup_contents);
        }
    };
    async_timeout(100).then(() => {popup.classList.add('expand');});

    return popup_contents;
}