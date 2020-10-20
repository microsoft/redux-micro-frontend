import React from 'react';

export class Todo extends React.Component {
    render() {
        return(
            <div onClick={() => this.props.removeTodo(this.props.id)}>
                <span>{this.props.description}</span>
            </div>
        )
    }
}