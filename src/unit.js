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
function createUnit(element) {
    if (typeof element === 'string' || typeof element === 'number') {
        return new TextUnit(element);
    }
}
export {
    createUnit
}