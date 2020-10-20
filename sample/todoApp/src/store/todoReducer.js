export const TodoReducer = (state = [], action) => {
    if (action.type === 'ADD_TODO') {
        return [...state, { id: state.length + 1, description: action.payload }];
    }
    if (action.type === 'REMOVE_TODO') {
        var todoId = action.payload;
        var index = state.findIndex(todo => todo.id === todoId);
        if (index === undefined || index === null || index < 0)
            return state;
        return [
            ...state.slice(0, index),
            ...state.slice(index + 1)
        ];
    }
    return state;
}