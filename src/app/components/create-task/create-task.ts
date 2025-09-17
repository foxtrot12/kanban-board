import { Component, inject, signal } from '@angular/core';
import { TaskManagerService } from '../../services/task-manager/task-manager.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-task',
  imports: [FormsModule, CommonModule],
  templateUrl: './create-task.html',
})
export class CreateTask {
  readonly taskManagerService = inject(TaskManagerService);
  
  title = signal('');
  description = signal('');

  createTask() {
    if (!this.title().trim()) {
      window.alert('Title is required to create a task.');
      return;
    }
    this.taskManagerService.createTask({
      title: this.title().trim(),
      description: this.description(),
    });
    this.title.set('');
    this.description.set('');
  }
}
