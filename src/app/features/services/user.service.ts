import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { createClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';

export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseKey,
  {
    auth: { persistSession:false, autoRefreshToken:false },
  }
);

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { 
  }

  private vehicleFilmsResource = rxResource({
    request: () => this.selectedVehicleForFilm(),
    loader: v => {
       const vehicle = v.request;
       if (vehicle) {
          return forkJoin(vehicle.films.map(link =>
             this.http.get<Film>(link)))
       }
       return of([] as Film[])
    }
 });
 vehicleFilms = computed(() => this.vehicleFilmsResource.value() ?? [] as Film[]);
 isLoading = this.vehicleFilmsResource.isLoading;
 error = computed(() => this.vehicleFilmsResource.error() as HttpErrorResponse);
 errorMessage = computed(() => setErrorMessage(this.error(), 'Films'));

getProducts():Observable<any[]> {
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
  
  // Método para buscar um produto específico pelo ID
  getProductById(id: number):Observable<any> {
  return from(
        supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
          .then(({ data: product, error}) => {
  if (error)throw new Error(error.message);
  return product
          })
      )
    }
}
