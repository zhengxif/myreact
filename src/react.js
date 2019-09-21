import $ from 'jquery'
import { createUnit } from './unit'
import { createElement } from './element'
let React = {
    render,
    createElement
}
// element 可能是一个文本节点，DOM节点(div)、自定义组件
function render(element, container) {
    let unit = createUnit(element);
    let markUp = unit.getMarkUp(0);
    $(container).html(markUp);
}

export default React;