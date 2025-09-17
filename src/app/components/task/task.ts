import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskT } from '../../services/task-manager/task-manager.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-task',
  imports: [TitleCasePipe],
  templateUrl: './task.html',
})
export class Task {
  @Input() task!: TaskT;
  @Output() dropTask = new EventEmitter();

  onDragEnd(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dropTask.emit({ dragEvent : event, taskId: this.task.id });
  }
}
