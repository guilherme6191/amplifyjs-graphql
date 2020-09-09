import Amplify, { API, graphqlOperation } from '@aws-amplify/api';

import awsconfig from './aws-exports';
import { createTodo, deleteTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import { onCreateTodo, onDeleteTodo } from './graphql/subscriptions';

Amplify.configure(awsconfig);

// mutations
async function createNewTodo() {
  const todo = {
    name: document.getElementById('user-input').value,
    description: `${new Date().toLocaleString()}`,
  };
  document.getElementById('user-input').value = '';
  return await API.graphql(graphqlOperation(createTodo, { input: todo }));
}

async function doDeleteTodo(id) {
  return await API.graphql(graphqlOperation(deleteTodo, { input: { id } }));
}

// trigger mutations
const MutationButton = document.getElementById('TodoForm');

MutationButton.addEventListener('submit', (e) => {
  e.preventDefault();
  createNewTodo().then((e) => {
    alert(`${e.data.createTodo.name} created`);
  });
});

document.addEventListener('click', function (e) {
  if (e.target && e.target.name == 'DeleteButton') {
    doDeleteTodo(e.target.id);
  }
});

// subscriptions
API.graphql(graphqlOperation(onDeleteTodo)).subscribe({
  next: (e) => {
    const el = document.getElementById(`li-${e.value.data.onDeleteTodo.id}`);
    el.remove();
  },
});

const SubscriptionResult = document.getElementById('SubscriptionResult');

API.graphql(graphqlOperation(onCreateTodo)).subscribe({
  next: (e) => {
    const todo = e.value.data.onCreateTodo;
    SubscriptionResult.innerHTML += createElTodoItem(todo);
  },
});

// queries
async function getData() {
  API.graphql(graphqlOperation(listTodos)).then((e) => {
    const todos = e.data.listTodos.items.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    todos.map((todo, i) => {
      QueryResult.innerHTML += createElTodoItem(todo);
    });
  });
}

getData();

// dom helper

const createElTodoItem = (todo) => `<li class="collection-item" id="li-${todo.id}">
  <span class="title">${todo.name}</span>
  <br />
  ${todo.description}
  <br />          
  <button class="btn red" id="${todo.id}" name="DeleteButton">Remove Todo</button>
</li>`;
