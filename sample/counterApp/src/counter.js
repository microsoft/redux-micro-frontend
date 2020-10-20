import React from 'react';

export class Counter extends React.Component {
    render() {
        return (
            <div>
                <h1>{this.props.header}</h1>
                <span>{this.props.count}</span>
                <button onClick={this.props.increment}>+</button>
                <button onClick={this.props.decrement}>-</button>
            </div>
        )
    }
}