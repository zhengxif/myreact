import { Element, createElement } from './element'
import $ from 'jquery';
class Unit {
    constructor(element) {
        this._currentElement = element;
    }
    
}
class TextUnit extends Unit {
    getMarkUp(reacid) {
        this._reacid = reacid;
        return `<span data-reactid="${reacid}">${ this._currentElement}</sapn>`;
    }
}
// Element元素 {type:'button',props:{id:'sayHello', style:{color:'red', backgroundColor:'green'}}, children:['say',{type:'b',{},'Hello'}]}
// 转成下面 字符串
{/* <button id="sayHello" style="color:red,background-color:green,onclick='sayHello()'">
    <span>say</span>
    <b>Hello</b>
</button> */}
class NativeUnit extends Unit {
    getMarkUp(reacid) {
        this._reacid = reacid;
        let { type, props } = this._currentElement;
        let tagStart = `<${type} data-reactid="${reacid}"`;
        let childString = '';
        let tagEnd = `</${type}>`;
        for(let propsName in props) {
            if (/^on[A-Z]/.test(propsName)) { // 时间绑定
                let eventName = propsName.slice(2).toLowerCase(); // click
                $(document).delegate(`[data-reactid="${this._reacid}"]`, `${eventName}.${this._reacid}`, props[propsName]);
            }else if(propsName === 'style'){ // 样式
                let styleObj = props[propsName];
                let styles = Object.entries(styleObj).map(([attr, value]) => {
                    return `${attr.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${value}`;
                }).join(';')
                tagStart += (` style="${styles}" `);
            }else if(propsName === 'className'){ // 类名
                tagStart += (` class="${props[propsName]}" `);
            }else if(propsName === 'children') {
                let children = props[propsName];
                children.forEach((child, index) => {
                    let childUnit = createUnit(child);
                    let childMarkUp = childUnit.getMarkUp(`${this._reacid}.${index}`);
                    childString += childMarkUp;
                })
            }else {
                tagStart += (` ${propsName}=${props[propsName]} `);
            }
        }
        return tagStart + '>' + childString + tagEnd
    }
}
class CompositeUnit extends Unit {
    getMarkUp(reacid) {
        this._reacid = reacid;
        let { type:Component, props } = this._currentElement;
        let componentInstance = new Component(props);
        let renderedElement = componentInstance.render();
        let renderedUnit = createUnit(renderedElement);
        return renderedUnit.getMarkUp(this._reacid);
    }
}
function createUnit(element) {
    if (typeof element === 'string' || typeof element === 'number') {
        return new TextUnit(element);
    }
    if (element instanceof Element && typeof element.type === 'string') {
        return new NativeUnit(element);
    }
    if (element instanceof Element && typeof element.type === 'function') {
        return new CompositeUnit(element);
    }
}
export {
    createUnit
}