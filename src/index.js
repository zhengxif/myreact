import React from './react'
// function sayHello() {
//     console.log('say hello');
// }
// jsx 需要babel转成js
// let element = (
//     <button id="sayHello" style={{ color: 'red', background: 'green'}} onClick={sayHello}>
//         say
//         <b>hello</b>
//     </button>
// )
// let element = React.createElement('button', {id: 'sayHello', style: {color: 'red', backgroundColor: 'green'}, onClick: sayHello},
//     'say', React.createElement('b', {}, 'hello'),
// )

class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            number: 0
        }
    }
    componentWillMount() {
        console.log('Counter componentWillMount')
    }
    componentDidMount() {
        console.log('Counter componentDidMount')
    }
    increment = () => {
        this.setState({
            number: this.state.number + 1
        })
    }
    render() {
        let p = React.createElement('p', { style: {color:'red'}}, this.props.name, this.state.number);
        let button = React.createElement('button', {onClick: this.increment}, '+')
        return React.createElement('div', {id: 'counter'}, p, button)
    }
}
let element = React.createElement(Counter, {name: '计数器'})
React.render(element, document.getElementById('root'))