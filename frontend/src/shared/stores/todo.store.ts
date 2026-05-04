import { defineStore } from 'pinia';
import type { Todo, TodoForm, TodoUpdateForm } from '../interfaces';
import { createTodo, deleteTodo, fetchAllTodo, fetchSearchTodo, updateTodo } from '../services';
import type { ResponseData } from '../helpers';

interface ResponseTodoData {
  id?: string;
  _id?: string;
  date: string | Date;
  text: string;
  completed: boolean;
  message?: string;
}

interface TodoState {
  allTodo: Todo[] | null;
  loading: boolean | false;
}

export const useTodo = defineStore('todo', {
  state: (): TodoState => ({
    allTodo: null,
    loading: false
  }),
  actions: {
    normalizeTodo(todoResponse: ResponseTodoData): Todo {
      return {
        id: String(todoResponse.id ?? todoResponse._id ?? ''),
        date: new Date(todoResponse.date),
        text: todoResponse.text,
        completed: todoResponse.completed
      };
    },
    async createTodo(todoForm: TodoForm) {
      this.loading = true;
      await createTodo(todoForm).then((response: ResponseData) => {
        const todoResponse = response as unknown as ResponseTodoData;
        const todo = this.normalizeTodo(todoResponse);
        if (this.allTodo) {
          this.allTodo.push(todo);
          this.allTodo = this.allTodo.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        }
        this.loading = false;
      });
    },
    async updateTodo(id: string, todoForm: TodoUpdateForm) {
      await updateTodo(id, todoForm).then((response: ResponseData) => {
        const todoResponse = response as unknown as ResponseTodoData;
        const updatedTodo = this.normalizeTodo(todoResponse);
        if (this.allTodo) {
          this.allTodo = this.allTodo.map((todo) =>
            todo.id === updatedTodo.id
              ? {
                  ...todo,
                  ...updatedTodo
                }
              : todo
          );
        }
      });
    },
    async deleteTodo(id: string) {
      await deleteTodo(id).then((response: ResponseData) => {
        const todoResponse = response as unknown as ResponseTodoData;
        if (this.allTodo) {
          const deletedId = String(todoResponse.id ?? todoResponse._id ?? '');
          this.allTodo = this.allTodo.filter((todo) => todo.id !== deletedId);
        }
      });
    },
    async fetchAllTodo() {
      this.loading = true;
      const todos = await fetchAllTodo();
      this.allTodo = todos
        ? todos.map((todo) => this.normalizeTodo(todo as unknown as ResponseTodoData))
        : [];
      this.loading = false;
    },
    async fetchSearchTodo(query: string) {
      this.loading = true;
      const todos = await fetchSearchTodo(query);
      this.allTodo = todos
        ? todos.map((todo) => this.normalizeTodo(todo as unknown as ResponseTodoData))
        : [];
      this.loading = false;
    }
  }
});
