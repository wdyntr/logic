export function serializeTodos(todos: any[]) {
  return todos.map(serializeTodo);
}

export function serializeTodo(todo: any) {
  return {
    ...todo,
    id: todo.id.toString(),
    userId: todo.userId.toString(),
  };
}
