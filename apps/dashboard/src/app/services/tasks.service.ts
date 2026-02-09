import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Task, TaskCategory, TaskStatus } from '@task-mgmt/data';
import { Observable } from 'rxjs';

const API_BASE_URL = 'http://localhost:3000/api';

export interface TaskFilters {
  category?: TaskCategory | '';
  status?: TaskStatus | '';
  search?: string;
  sort?: 'order' | 'title' | 'status';
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(private readonly http: HttpClient) {}

  list(filters: TaskFilters): Observable<Task[]> {
    let params = new HttpParams();
    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }
    return this.http.get<Task[]>(`${API_BASE_URL}/tasks`, { params });
  }

  create(task: Partial<Task>) {
    return this.http.post<Task>(`${API_BASE_URL}/tasks`, task);
  }

  update(id: string, task: Partial<Task>) {
    return this.http.put<Task>(`${API_BASE_URL}/tasks/${id}`, task);
  }

  remove(id: string) {
    return this.http.delete<{ deleted: boolean }>(`${API_BASE_URL}/tasks/${id}`);
  }
}
