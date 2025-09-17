import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  TaskManagerService,
  TaskStatus,
  TaskT,
} from '../../services/task-manager/task-manager.service';
import { Task } from '../task/task';
import { CreateTask } from '../create-task/create-task';
import { TitleCasePipe } from '@angular/common';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-kanban-board',
  imports: [Task, CreateTask, TitleCasePipe],
  templateUrl: './kanban-board.html',
})
export class KanbanBoard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('statusColumns') statusColumns!: QueryList<ElementRef>;

  #statusRegions: Map<
    TaskStatus,
    { start: { x: number; y: number }; end: { x: number; y: number } }
  > = new Map();

  #resizeSubs = new Subscription();

  readonly taskManagerService = inject(TaskManagerService);

  readonly tasksByStatus = computed<
    Array<{
      status: TaskStatus;
      title: string;
      tasks: Array<TaskT>;
    }>
  >(() => [
    { status: 'ToDo', title: 'To Do', tasks: this.taskManagerService.todoTasks() },
    {
      status: 'InProgress',
      title: 'In Progress',
      tasks: this.taskManagerService.InProgressTasks(),
    },
    { status: 'Done', title: 'Done', tasks: this.taskManagerService.doneTasks() },
  ]);

  onDropTask(ev: { dragEvent: DragEvent; taskId: string }) {
    const { dragEvent, taskId } = ev;
    const status = this.findStatusByCoordinates(dragEvent.clientX, dragEvent.clientY);
    if (status) {
      this.taskManagerService.updateTaskStatus(taskId, status);
    }
  }

  private calculateStatusRegions() {
    this.statusColumns.forEach((col, ind) => {
      const status = this.tasksByStatus()[ind].status;
      const rect = col.nativeElement.getBoundingClientRect();
      this.#statusRegions.set(status, {
        start: { x: rect.left, y: rect.top },
        end: { x: rect.right, y: rect.bottom },
      });
    });
  }

  private findStatusByCoordinates(x: number, y: number): TaskStatus | null {
    for (const [status, region] of this.#statusRegions) {
      if (x >= region.start.x && x <= region.end.x && y >= region.start.y && y <= region.end.y) {
        return status;
      }
    }
    return null;
  }

  ngOnInit(): void {
    this.#resizeSubs = fromEvent(window, 'resize').subscribe(() => {
      this.calculateStatusRegions();
    });
  }

  ngAfterViewInit(): void {
    this.calculateStatusRegions();
  }

  ngOnDestroy(): void {
    this.#resizeSubs.unsubscribe();
  }
}
