import { Element, createElement } from './element'

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
// Element元素 {type:'button',props:{id:'sayHello'}, children:['say',{type:'b',{},'Hello'}]}
// 转成下面 字符串
{/* <button id="sayHello" style="color:red,background-color:green,onclick='sayHello()'">
    <span>say</span>
    <b>Hello</b>
</button> */}
class NativeUnit extends Unit {
    getMarkUp(reacid) {
        this._reacid = reacid;
        let { type, props } = this._currentElement;
        let tagStart = `<${type} `;
        let childString = '';
        let tagEnd = `</${type}>`;
        for(let propsName in props) {
            if (/^on[A-Z]/.test(propsName)) { // 时间绑定

            }else if(propsName === 'style'){ // 样式

            }else if(propsName === 'className'){ // 类名

            }else if(propsName === 'children') {

            }else {
                tagStart += (` ${propsName}=${props[propsName]} `);
            }
        }
        return tagStart + '>' + childString + tagEnd
    }
}
function createUnit(element) {
    if (typeof element === 'string' || typeof element === 'number') {
        return new TextUnit(element);
    }
    if (element instanceof Element && typeof element.type === 'string') {
        return new NativeUnit(element);
    }
}
export {
    createUnit
}