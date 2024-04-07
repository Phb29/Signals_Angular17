import { Component, computed, effect, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";

interface Task {
  title: string;
  isCompleted: boolean;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  template: `
<div class="main">
    <input
      type="text"
    placeholder="tarefa"
      [formControl]="taskControl"
      (keydown.enter)="addTask()"
    />

    <h3>Tarefas a Fazer</h3>

    <ng-container *ngIf="hasUncompletedTasks(); else noTasks">
      <ul>
        <ng-container *ngFor="let item of uncompletedTasks()">
          <li class="item">
            <strong>{{ item.title }}</strong>
            <button (click)="markTaskAsCompleted(item)">
              Marcar como concluído
            </button>
            <button (click)="removeTask(item)">Remove</button>
          </li>
        </ng-container>
      </ul>
    </ng-container>

    <h3>Terefa Terminada</h3>

    <ng-container *ngIf="hasCompletedTasks(); else noTasks">
      <ul>
        <ng-container *ngFor="let item of completedTasks()">
          <li class="item completed">
            <strong>{{ item.title }}</strong>
            <button (click)="removeTask(item)">Remove</button>
          </li>
        </ng-container>
      </ul>
    </ng-container>

    <ng-template #noTasks>
      <div>
        <span>Aqui não há tarefas para mostrar</span>
      </div>
    </ng-template>
</div>
  `,
  styles: [
    `
      .item {
        &.completed {
          text-decoration: line-through;
        }

        padding: 8px;

        font-size: 18px;

        button {
          margin-left: 8px;
        }
 
      }
      .main{
display: flex;
align-items: center;
justify-self: center;
flex-direction: column;

}
    `,
  ],
})
export class AppComponent {
  taskControl = new FormControl("", Validators.required);

  tasks = signal<Task[]>(this.getTasksFromStorage());

  uncompletedTasks = computed(() =>
    this.tasks().filter((task) => !task.isCompleted)
  );

  completedTasks = computed(() =>
    this.tasks().filter((task) => task.isCompleted)
  );

  hasCompletedTasks = computed(() => this.completedTasks().length > 0);

  hasUncompletedTasks = computed(() => this.uncompletedTasks().length > 0);

  constructor() {
    effect(() => {
      this.saveTasksInStorage();
    });
  }

  addTask() {
    if (this.taskControl.invalid) {
      return;
    }

    this.tasks.update((tasks) => {
      const taskTitle = this.taskControl.value as string;

      const newTask: Task = { title: taskTitle, isCompleted: false };

      return [...tasks, newTask];
    });

    this.taskControl.reset();
  }

  markTaskAsCompleted(task: Task) {
    this.tasks.mutate((tasks) => {
      const taskIndex = tasks.indexOf(task);

      const taskMarkedAsCompleted: Task = { ...task, isCompleted: true };

      tasks.splice(taskIndex, 1, taskMarkedAsCompleted);
    });
  }

  removeTask(task: Task) {
    this.tasks.mutate((tasks) => {
      const taskIndex = tasks.indexOf(task);
      tasks.splice(taskIndex, 1);
    });
  }

  saveTasksInStorage() {
    if (this.tasks()) {
      window.localStorage.setItem("tasks", JSON.stringify(this.tasks()));
    }
  }

  getTasksFromStorage() {
    return JSON.parse((window.localStorage.getItem("tasks") as string) || "[]");
  }
}
