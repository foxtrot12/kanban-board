//Reusable utility service for managing tasks in a Kanban board application using Angular signals.

import { Injectable, signal, computed, effect } from '@angular/core';
import { generateUniqueId, loadFromLocalStorage, saveToLocalStorage } from '../../utils/jsUtils';

export type TaskStatus = 'ToDo' | 'InProgress' | 'Done';

export interface TaskT {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class TaskManagerService {
  readonly #STORAGE_KEY = 'kanban-tasks';

  #tasks = signal<TaskT[]>(this.loadFromStorage());

  readonly allTasks = computed(() => this.#tasks());
  readonly todoTasks = computed(() => this.#tasks().filter((task) => task.status === 'ToDo'));
  readonly InProgressTasks = computed(() =>
    this.#tasks().filter((task) => task.status === 'InProgress')
  );
  readonly doneTasks = computed(() => this.#tasks().filter((task) => task.status === 'Done'));

  readonly taskCounts = computed(() => ({
    todo: this.todoTasks().length,
    InProgress: this.InProgressTasks().length,
    done: this.doneTasks().length,
    total: this.allTasks().length,
  }));

  constructor() {
    // Auto-save to localStorage whenever tasks change
    this.setupAutoSave();
  }

  createTask(taskData: Pick<TaskT, 'title' | 'description'>): TaskT {
    const newTask: TaskT = {
      id: this.generateId(),
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      status: 'ToDo',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.#tasks.update((tasks) => [...tasks, newTask]);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Omit<TaskT, 'id' | 'createdAt'>>): TaskT | null {
    const taskIndex = this.#tasks().findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      console.warn(`Task with id ${id} not found`);
      return null;
    }

    this.#tasks.update((tasks) => {
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        ...updates,
        updatedAt: new Date(),
      };
      return updatedTasks;
    });

    return this.#tasks()[taskIndex];
  }

  updateTaskStatus(id: string, newStatus: TaskStatus): TaskT | null {
    return this.updateTask(id, { status: newStatus });
  }

  deleteTask(id: string): boolean {
    const initialLength = this.#tasks().length;
    this.#tasks.update((tasks) => tasks.filter((task) => task.id !== id));
    return this.#tasks().length < initialLength;
  }

  getTask(id: string): TaskT | undefined {
    return this.#tasks().find((task) => task.id === id);
  }

  getTasksByStatus(status: TaskStatus): TaskT[] {
    return this.#tasks().filter((task) => task.status === status);
  }

  clearAllTasks(): void {
    this.#tasks.set([]);
  }

  private loadFromStorage(): TaskT[] {
    try {
      const parsedTasks = loadFromLocalStorage<TaskT[]>(this.#STORAGE_KEY);
      if (!parsedTasks) return [];
      // Convert date strings back to Date objects
      return parsedTasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  private saveToStorage(): void {
    try {
      const tasksToSave = this.#tasks();
      saveToLocalStorage(tasksToSave, this.#STORAGE_KEY);
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  private setupAutoSave(): void {
    effect(() => {
      this.saveToStorage();
    });
  }

  private generateId(): string {
    return `task${generateUniqueId()}`;
  }
}
