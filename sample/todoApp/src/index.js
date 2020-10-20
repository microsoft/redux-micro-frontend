import React from 'react';
import { render } from 'react-dom';
import { TodoList } from './todoList';


const mountTodo = (elementId) => {
    const renderElemement = document.getElementById(elementId);
    render(<TodoList />, renderElemement);
}

window["mountTodo"] = mountTodo;

if (!(window["micro-front-end-context"])) {
    mountTodo("app");
}