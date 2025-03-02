import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { createClient } from '@supabase/supabase-js';
import { forkJoin, from, Observable, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop'
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { DatabaseService } from '../../core/services/database.service';

export class UserService {
  database = inject(DatabaseService)
  table = signal("User")

  private selectedUserId = signal<number | null>(null)

  constructor() {  
  }

  private usersResource = rxResource({
    loader: () => this.getUsers()
  });

  private userResource = rxResource({
    request: () => this.selectedUserId(),
    loader: ({request: userId}) => 
      userId ? this.getUserById(userId) : of(null)
  });

  users = computed(() => this.usersResource.value() ?? []);
  user = computed(() => this.userResource.value() ?? []);

  isLoading = computed(() => this.usersResource.isLoading() || this.userResource.isLoading());
  error = computed(() => this.usersResource.error() || this.userResource.error());

  reloadUsers() {
    this.usersResource.reload();
  }

  setSelectedUser(id: number | null) {
    this.selectedUserId.set(id);
  }

  private getUserById(id: number): Observable<User | null> {
    return from(this.database.getByID(this.table(),id));
  }

  private getUsers():Observable<User[]> {
    return from(this.database.getAll(this.table()))
      }
    }
