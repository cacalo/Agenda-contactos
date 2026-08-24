import { Component, inject, signal } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { form, FormField, required, minLength, submit } from '@angular/forms/signals';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-login',
  imports: [RouterModule, MatInputModule,MatFormFieldModule,MatButtonModule,FormField,MatCard],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  readonly snackBarService = inject(SnackBarService)

  /** Datos del formulario de login */
  readonly loginModel = signal({ email: '', password: '' });

  readonly loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'El correo es obligatorio' });
    minLength(schemaPath.email, 4);
    required(schemaPath.password, { message: 'La contraseña es obligatoria' });
    minLength(schemaPath.password, 8);
  });

  /** Intenta loguear al usuario con el back */
  onSubmit() {
    submit(this.loginForm, async () => {
      const login = await this.authService.login(this.loginModel());
      if(login.success) this.router.navigate(["contacts"]);
      else {
        this.snackBarService.openSnackbarError(login.message);
      }
    });
  }

}
