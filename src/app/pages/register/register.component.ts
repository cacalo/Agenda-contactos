import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, email, validate, submit } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { RegisterData } from '../../interfaces/register';
import { AuthService } from '../../services/auth.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-register',
  imports: [FormField,MatInputModule,MatFormFieldModule,MatButtonModule, RouterModule,MatCardModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  authService = inject(AuthService);
  snackBarService = inject(SnackBarService)
  router = inject(Router);

  /** Datos de formulario de registro */
  readonly registerModel = signal({
    firstName: '',
    lastName: '',
    password: '',
    password2: '',
    email: '',
  });

  readonly registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.firstName, { message: 'El nombre es obligatorio' });
    required(schemaPath.lastName, { message: 'El apellido es obligatorio' });
    required(schemaPath.password, { message: 'La contraseña es obligatoria' });
    required(schemaPath.password2, { message: 'Debés repetir la contraseña' });
    required(schemaPath.email, { message: 'El correo es obligatorio' });
    email(schemaPath.email, { message: 'Correo inválido' });

    validate(schemaPath.password2, ({ value, valueOf }) => {
      if (value() && value() !== valueOf(schemaPath.password)) {
        return { kind: 'passwordMismatch', message: 'Las contraseñas no coinciden' };
      }
      return undefined;
    });
  });

  /** Intenta registrar al usuario en el back */
  onSubmit(){
    submit(this.registerForm, async () => {
      const { firstName, lastName, password, email } = this.registerModel();
      const registerData: RegisterData = { firstName, lastName, password, email };
      const register = await this.authService.register(registerData);
      if(!register.success){
        this.snackBarService.openSnackbarError(register.message);
      } else {
        this.snackBarService.openSnackbarSuccess(register.message);
        this.router.navigate(["/login"])
      }
    });
  }
}
