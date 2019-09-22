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
            odd: true
        }
    }
    componentWillMount() {
        console.log('Counter componentWillMount')
    }
    componentDidMount() {
        console.log('Counter componentDidMount')
        setTimeout(()=>{
            this.setState({
                odd: !this.state.odd
            })
        }, 1000)
    }
    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }
    componentDidUpdate() {
        console.log('Counter componentDidUpdate')
    }
    increment = () => {
        this.setState({
            number: this.state.number + 1
        })
    }
    render() {
        // console.log(this.state.number)
        // let p = React.createElement('p', {}, this.props.name, this.state.number);
        // let button = React.createElement('button', {onClick: this.increment}, '+')
        // return React.createElement('div', {id: 'counter', style: {color: this.state.number%2 == 0 ? "red" : "green",backgroundColor: this.state.number%2 == 0 ? "green" : "red"}}, p, button)
        if(this.state.odd) {
            return React.createElement('ul', {},
                React.createElement('li', {key: 'A'}, 'A'),
                React.createElement('li', {key: 'B'}, 'B'),
                React.createElement('li', {key: 'C'}, 'C'),
                React.createElement('li', {key: 'D'}, 'D'),
            )
        }
        return React.createElement('ul', {},
            React.createElement('li', {key: 'A'}, 'A1'),
            React.createElement('li', {key: 'C'}, 'C1'),
            React.createElement('li', {key: 'B'}, 'B'),
            React.createElement('li', {key: 'E'}, 'E1'),
            React.createElement('li', {key: 'F'}, 'F1'),
        )
    }
}
let element = React.createElement(Counter, {name: '计数器'})
React.render(element, document.getElementById('root'))