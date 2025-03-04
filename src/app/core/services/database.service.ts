import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export const supabase = createClient(
  environment.SUPABASE_URL,
  environment.SUPABASE_ADMIN_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  // Expondo o cliente Supabase para uso direto
  readonly supabase = supabase;

  constructor() { }

  async getByID(table: string, id: number | string) {     
    return supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
  }

  async getAll(table: string){
    return supabase
            .from(table)
            .select('*')
            .then(({ data: User, error}) => {
      if (error)throw new Error(error.message);
      return User || []
            })
  }

  async getUserProfile(id: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
  }
}
