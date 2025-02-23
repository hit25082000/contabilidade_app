import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-details',
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
  providers: [UserService]
})
export class UserDetailsComponent {
  userService = inject(UserService)

  constructor(){
    this.userService.setSelectedUser(1);
  }
}
