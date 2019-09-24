import { Element, createElement } from './element'
import types from './types'
import $ from 'jquery';
let diffQueue = []; // 差异队列
let updateDeth = 0; // 更新的级别
class Unit {
    constructor(element) {
        this._currentElement = element;
    }
    
}
class TextUnit extends Unit {
    update(nextElement) {
        if (this._currentElement !== nextElement) {
            this._currentElement = nextElement;
            $(`[data-reactid="${this._reacid}"]`).html(nextElement);
        }
    }
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
    update(nextElement) {
        console.log(nextElement)
        let oldProps = this._currentElement.props;
        let newProps = nextElement.props;
        this.updateDOMPropertise(oldProps, newProps);
        this.updateDOMChildren(nextElement.props.children);
    }
    //此处要把新的儿子们传过来，然后我把我的老儿子进行对比，然后找出差异，进行修改DOM
    updateDOMChildren(newChildrenElements) {
        updateDeth++;
        this.diff(diffQueue, newChildrenElements);
        updateDeth--;
        if (updateDeth === 0) {
            this.patch(diffQueue);
            diffQueue = [];
        }
    }
    patch(diffQueue) {
        let deleteChildren = []; // 这里要放着所有将要删除的节点
        let deleteMap = {}; // 这里暂存能复用的节点
        for(let i = 0; i < diffQueue.length; i++) {
            let difference = diffQueue[i];
            if (difference.type === types.MOVE || difference.type === types.REMOVE) {
                let fromIndex = difference.fromIndex;
                let oldChild = $(difference.parentNode.children().get(fromIndex));
                deleteMap[fromIndex] = oldChild;
                deleteChildren.push(oldChild);
            }
        }
        $.each(deleteChildren, (idx, item) => {
            $(item).remove();
        })

        for(let i = 0; i < diffQueue.length; i++) {
            let difference = diffQueue[i];
            switch (difference.type) {
                case types.INSERT:
                    this.insertChildAt(difference.parentNode, difference.toIndex, $(difference.markUp));
                    break;
                case types.MOVE:
                    this.insertChildAt(difference.parentNode, difference.toIndex, deleteMap[difference.fromIndex]);
                    break;
                default:
                    break;
            }
        }
    }
    insertChildAt(parentNode, index, newNode) {
        let oldChild = parentNode.children().get(index);
        oldChild ? newNode.insertBefore(oldChild):newNode.appendTo(parentNode);
    }
    diff(diffQueue, newChildrenElements) {
        // 生成一个map, key=老的unit
        let oldChildrenUnitMap = this.getOldChilrenMap(this._renderedChildrenUnits);
        // 生成一个新的儿子unit的数组
        let { newChildrenUnits, newChildrenUnitMap } = this.getNewChildrenUnits(oldChildrenUnitMap, newChildrenElements);
        let lastIndex = 0; // 上一个已经确定的索引
        for (let i = 0; i < newChildrenUnits.length; i++) {
            let newUnit  = newChildrenUnits[i];
            let newKey = (newUnit._currentElement.props && newUnit._currentElement.props.key) || i.toString();
            let oldChildUnit = oldChildrenUnitMap[newKey];
            if (oldChildUnit === newUnit) { // 如果一致， 说明复用老节点
                if (oldChildUnit._mountIndex < lastIndex) {
                    diffQueue.push({
                        parentId: this._reacid,
                        parentNode: $(`[data-reactid="${this._reacid}"]`),
                        type: types.MOVE,
                        fromIndex: oldChildUnit._mountIndex,
                        toIndex: i
                    })
                }
                lastIndex = Math.max(lastIndex, oldChildUnit._mountIndex);
            }else {
                diffQueue.push({
                    parentId: this._reacid,
                    parentNode: $(`[data-reactid="${this._reacid}"]`),
                    type: types.INSERT,
                    toIndex: i,
                    markUp: newUnit.getMarkUp(`${this._reacid}.${i}`)
                })
            }
            newUnit._mountIndex = i;
        }
        for(let oldKey in oldChildrenUnitMap) {
            let oldChild = oldChildrenUnitMap[oldKey];
            if (!newChildrenUnitMap.hasOwnProperty(oldKey)) {
                diffQueue.push({
                    parentId: this._reacid,
                    parentNode: $(`[data-reactid="${this._reacid}"]`),
                    type: types.REMOVE,
                    fromIndex: oldChild._mountIndex
                })
            }
        }

    }
    getNewChildrenUnits(oldChildrenUnitMap, newChildrenElements) {
        let newChildrenUnits = [];
        let newChildrenUnitMap = {};
        newChildrenElements.forEach((newElement, i) => {
            let newKey = (newElement.props && newElement.props.key) || i.toString();
            let oldUnit = oldChildrenUnitMap[newKey]; // 找到老的unit
            let oldElement = oldUnit && oldUnit._currentElement; // 获取老元素
            if(shouldDeepCompare(oldElement, newElement)) {
                oldUnit.update(newElement);
                newChildrenUnits.push(oldUnit);
                newChildrenUnitMap[newKey] = oldUnit;
            }else {
                let nextUnit = createUnit(newElement);
                newChildrenUnits.push(nextUnit);
                newChildrenUnitMap[newKey] = nextUnit;
            }
        })
        return {
            newChildrenUnits,
            newChildrenUnitMap
        };
    }
    getOldChilrenMap(childrenUnits = []) {
        let map = {};
        for(let i=0; i<childrenUnits.length; i++) {
            let unit=  childrenUnits[i];
            let key = (unit._currentElement.props && unit._currentElement.props.key) || i.toString();
            map[key] = unit;
        }
        return map;
    }
    updateDOMPropertise(oldProps, newProps) {
        let propName;
        for (propName in oldProps) {// 循环老的属性集合
            if (!newProps.hasOwnProperty(propName)) { // 删除没有的属性
                $(`[date-reactid="${this._reacid}"]`).removeAttr(propName);
            }
            if (/^on[A-Z]/.test(propName)) { // 取消绑定
                $(document).undelegate(`.${this._reacid}`);
            }
        }
        for(propName in newProps) {
            if (propName == 'children') {
                continue
            }else if(/^on[A-Z]/.test(propName)) {
                let eventName = propName.slice(2).toLowerCase(); 
                $(document).delegate(`[data-reactid="${this._reacid}"]`, `${eventName}.${this._reacid}`, newProps[propName]);
            }else if(propName == 'className') {
                $(`[date-reactid="${this._reacid}"]`).attr('class', propName);
            }else if(propName == 'style') {
                let styleObj = newProps[propName];
                Object.entries(styleObj).forEach(([attr, value]) => {
                    $(`[data-reactid="${this._reacid}"]`).css(attr, value);
                })
            }else {
                $(`[date-reactid="${this._reacid}"]`).prop(propName, newProps[propName]);
            }
        }
    }
    getMarkUp(reacid) {
        this._reacid = reacid;
        let { type, props } = this._currentElement;
        let tagStart = `<${type} data-reactid="${reacid}"`;
        let childString = '';
        let tagEnd = `</${type}>`;
        this._renderedChildrenUnits = [];
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
                    childUnit._mountIndex = index; // 每个unit有一个_mountIndex属性，指向自己在父节点中的位置
                    this._renderedChildrenUnits.push(childUnit);
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
    update(nextElement, partialState) {
        // 先获取到新的元素
        this._currentElement = nextElement || this._currentElement;
        // 获取新的状态, 不管要不要更新组件，组件的状态一定要修改
        let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state, partialState);
        // 新的属性对象
        let nextProps = this._currentElement.props;
        if (this._componentInstance.shouldComponentUpdate && !this._componentInstance.shouldComponentUpdate(nextProps, nextState)) {
            return;
        }
        // 下面要进行比较更行   先得到上次渲染的单元
        let preRenderedUnitInstance = this._renderedUnitInstance;
        // 得到上次渲染的元素
        let preRenderedElement = preRenderedUnitInstance._currentElement;
        // 这次的渲染元素
        let nextRenderedElement = this._componentInstance.render();
        // 如果新旧元素类型一样，则可以进行深度比较，如果不一样，直接干掉老的元素，新建新的元素
        if (shouldDeepCompare(preRenderedElement, nextRenderedElement)) {
            preRenderedUnitInstance.update(nextRenderedElement);
            this._componentInstance.componentDidUpdate && this._componentInstance.componentDidUpdate();
        }else {
            this._renderedUnitInstance = createUnit(nextElement);
            let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._reacid);
            $(`[data-reactid="${this._reacid}"]`).replaceWith(nextMarkUp);
        }

    }
    getMarkUp(reacid) {
        this._reacid = reacid;
        let { type:Component, props } = this._currentElement;
        let componentInstance = this._componentInstance = new Component(props);
        // 组件实例上的_currentUnit属性挂载了当前unit
        componentInstance._currentUnit = this;
        componentInstance.componentWillMount && componentInstance.componentWillMount();
        // 调用组件的render方法，获得要渲染的元素
        let renderedElement = componentInstance.render();
        // 得到这个元素对应的unit
        let renderedUnitInstance = this._renderedUnitInstance =  createUnit(renderedElement);
        let renderedMarkup = renderedUnitInstance.getMarkUp(this._reacid);
        // 在这个时候绑定一个事件
        $(document).on('mounted', () => {
            componentInstance.componentDidMount && componentInstance.componentDidMount();
        })
        return renderedMarkup;
    }
}
// 判断两个元素的类型一样不一样
function shouldDeepCompare(oldElement, newElement) {
    if (oldElement != null && newElement != null) {
        let oldType = typeof oldElement;
        let newType = typeof newElement;
        if ((oldType === 'string' || oldType === 'number') && (newType === 'string' || newType === 'number')) {
            return true;
        }
        if (oldElement instanceof Element && newElement instanceof Element) {
            return oldElement.type == newElement.type;
        }
    }
    return false;
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