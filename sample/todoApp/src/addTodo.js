import React from 'react';

export class AddTodo extends React.Component {

    constructor(props) {
        super(props);
        this.addTodo = this.addTodo.bind(this);
    }

    addTodo() {
        this.props.addTodo(this.description.value);
        this.description.value = '';
    }

    render() {
        return (
            <div>
                <input type='Text' placeholder="Enter Todo" ref={node => {
                    this.description = node;
                }}></input>
                <button onClick={this.addTodo}>Submit</button>
            </div>
        )
    }
}