export function _valueOf (element, context) {
element = typeof(element) === "string"? $(`#${element}`, context) : element;
return element.hasAttribute("value")? _get(element.value)
:  (element.hasAttribute("data-value")? _get(element.dataset.value) : "");

function _get(x) {
return x? (Number(x) || x)
: "";
} // _get
} // _valueOf

export function $ (selector, context = document) {
return context.querySelector(selector);
} // $
