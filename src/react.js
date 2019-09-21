import $ from 'jquery'
import { createUnit } from './unit'
import { createElement } from './element'
import Component from './component'

let React = {
    render,
    createElement,
    Component
}
// element 可能是一个文本节点，DOM节点(div)、自定义组件
function render(element, container) {
    // unit单元就是用来负责渲染的，负责把元素转换成可以在页面上显示的HTML字符串
    let unit = createUnit(element);
    let markUp = unit.getMarkUp(0);
    $(container).html(markUp);
}


export default React;