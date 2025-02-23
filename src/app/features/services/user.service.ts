import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { createClient } from '@supabase/supabase-js';
import { forkJoin, from, Observable, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop'
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';

export const supabase = createClient(
  environment.SUPABASE_URL,
  environment.SUPABASE_ADMIN_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

export class UserService {
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
    return from(
      supabase
        .from('User')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    );
  }

  private getUsers():Observable<User[]> {
    return from(
          supabase
            .from('User')
            .select('*')
            .then(({ data: User, error}) => {
      if (error)throw new Error(error.message);
      return User || []
            })
        )
      }
    }
