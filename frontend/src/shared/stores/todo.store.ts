import { defineStore } from 'pinia';
import type { Todo, TodoForm, TodoUpdateForm } from '../interfaces';
import { createTodo, deleteTodo, fetchAllTodo, fetchSearchTodo, updateTodo } from '../services';
import type { ResponseData } from '../helpers';

interface ResponseTodoData {
  id?: string;
  _id?: string;
  date: string;
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
        id: todoResponse.id || todoResponse._id || '',
        date: new Date(todoResponse.date),
        text: todoResponse.text,
        completed: todoResponse.completed
      };
    },
    async createTodo(todoForm: TodoForm) {
      this.loading = true;
      try {
        const response = await createTodo(todoForm);
        const todoResponse = response as unknown as ResponseTodoData;
        const todo = this.normalizeTodo(todoResponse);
        if (!this.allTodo) {
          this.allTodo = [];
        }
        this.allTodo.push(todo);
        this.allTodo = this.allTodo.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      } finally {
        this.loading = false;
      }
    },
    async updateTodo(id: string, todoForm: TodoUpdateForm) {
      const response = await updateTodo(id, todoForm);
      const todoResponse = response as unknown as ResponseTodoData;
      if (this.allTodo) {
        const updatedTodo = this.normalizeTodo(todoResponse);
        this.allTodo = this.allTodo.map((todo) =>
          todo.id === updatedTodo.id
            ? {
                ...todo,
                date: updatedTodo.date,
                text: updatedTodo.text,
                completed: updatedTodo.completed
              }
            : todo
        );
      }
    },
    async deleteTodo(id: string) {
      const response = await deleteTodo(id);
      const todoResponse = response as unknown as { id?: string; _id?: string };
      const deletedId = todoResponse.id || todoResponse._id;
      if (this.allTodo && deletedId) {
        this.allTodo = this.allTodo.filter((todo) => todo.id !== deletedId);
      }
    },
    async fetchAllTodo() {
      this.loading = true;
      try {
        const response = await fetchAllTodo();
        const list = (response || []) as ResponseTodoData[];
        this.allTodo = list.map((todo) => this.normalizeTodo(todo));
      } catch (error) {
        this.allTodo = [];
        console.error('fetchAllTodo error:', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchSearchTodo(query: string) {
      this.loading = true;
      try {
        const response = await fetchSearchTodo(query);
        const list = (response || []) as ResponseTodoData[];
        this.allTodo = list.map((todo) => this.normalizeTodo(todo));
      } catch (error) {
        this.allTodo = [];
        console.error('fetchSearchTodo error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
