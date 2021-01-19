/**
 * Module of shared functions for client-side sites
 * @module shared
 */

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
        if (event.target === background || event.target === document.body) {
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
 * @returns {Promise<HTMLElement>} Resolves to the popup Element created after it finishes expanding
 */
export async function expand_popup(source, parent) {
    var background = document.createElement('div');
    background.classList.add('popup_background');
    var popup = document.createElement('div');
    popup.classList.add('popup');
    var popup_contents = document.createElement('div');
    popup_contents.classList.add('popup_contents');

    var rect = source.getBoundingClientRect();
    var parent_rect = parent.getBoundingClientRect();
    var top = window.getComputedStyle(parent).position !== 'static' ? (rect.top + window.scrollY - parent_rect.top) : (rect.top + window.scrollY);
    var left = window.getComputedStyle(parent).position !== 'static' ? (rect.left + window.scrollX - parent_rect.left) : (rect.left + window.scrollX);
    var border = window.getComputedStyle(source).borderRadius;
    var color = window.getComputedStyle(source).backgroundColor;
    popup.style.cssText = '--source_width: ' + rect.width + 'px; --source_height: ' +
                            rect.height + 'px; --source_top: ' + top + 'px; --source_left: ' + left + 'px; --source-br: ' + border + '; --source_bc: ' + color + ';';

    popup.appendChild(popup_contents);
    background.appendChild(popup);
    parent.appendChild(background);

    var onclick_func = parent.onclick;
    parent.onclick = function(event) {
        if (onclick_func) {
            onclick_func(event);
        }
        if (event.target === background) {
            rect = source.getBoundingClientRect();
            parent_rect = parent.getBoundingClientRect();
            top = window.getComputedStyle(parent).position !== 'static' ? (rect.top + window.scrollY - parent_rect.top) : (rect.top + window.scrollY);
            left = window.getComputedStyle(parent).position !== 'static' ? (rect.left + window.scrollX - parent_rect.left) : (rect.left + window.scrollX);
            border = window.getComputedStyle(source).borderRadius;
            color = window.getComputedStyle(source).backgroundColor;
            popup.style.cssText = '--source_width: ' + rect.width + 'px; --source_height: ' +
                            rect.height + 'px; --source_top: ' + top + 'px; --source_left: ' + left + 'px; --source-br: ' + border + '; --source_bc: ' + color + ';';

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

    var t_promise = new Promise((resolve) => {
        popup.ontransitionend = (event) => {
            if (event.propertyName === 'width') {
                popup.style.minHeight = '90%';
                popup.style.height = 'auto';
                resolve();
            }
        };
    });
    await async_timeout(20);  // Need to await for at least one browser paint (usually 60Hz) to ensure popup appears before expanding
    popup.classList.add('expand');
    await t_promise;

    return popup_contents;
}
