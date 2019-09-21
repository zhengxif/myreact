import React from './react'
function sayHello() {
    console.log('say hello');
}
// jsx 需要babel转成js
// let element = (
//     <button id="sayHello" style={{ color: 'red', background: 'green'}} onClick={sayHello}>
//         say
//         <b>hello</b>
//     </button>
// )
let element = React.createElement('button', {id: 'sayHello', style: {color: 'red', background: 'green'}, onClick: sayHello},
    'say', React.createElement('b', {}, 'hello'),
)

React.render(element, document.getElementById('root'))