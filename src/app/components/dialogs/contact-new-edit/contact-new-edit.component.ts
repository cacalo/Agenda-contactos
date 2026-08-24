import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ContactsService } from '../../../services/contacts.service';
import { form, FormField, required, email, minLength, submit } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Contact, NewContact, CONTACTO_NUEVO_VACIO } from '../../../interfaces/contact';
import { Router } from '@angular/router';
import { SnackBarService } from '../../../services/snack-bar.service';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-contact-new-edit',
  imports: [FormField,MatFormFieldModule,MatInputModule,MatButtonModule,MatDialogModule],
  templateUrl: './contact-new-edit.component.html',
  styleUrl: './contact-new-edit.component.scss',
})
export class ContactNewEditComponent {
  readonly contactsService = inject(ContactsService);
  readonly router = inject(Router);
  readonly snackBarService = inject(SnackBarService)
  readonly dialogRef = inject(MatDialogRef<ContactNewEditComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  /** Input de ID, se utiliza cuando entramos a este componente con parámetros de ruta para editar un contacto */
  readonly id = input<number>();

  /** Contiene el contacto a editar */
  readonly contact = computed(()=> {
    if(this.data) return this.data; //En caso de abrir este componente como un modal
    if(!this.id()) return undefined; //En caso de abrir este componente como una ruta
    return this.contactsService.contacts.value()?.find(contact => contact.id == this.id())
  });

  /** Datos del formulario de contacto */
  readonly formModel = signal({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    address: '',
    email: '',
    description: '',
    imageUrl: '',
  });

  readonly contactForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.firstName, { message: 'El nombre es obligatorio' });
    required(schemaPath.phone, { message: 'El teléfono es obligatorio' });
    minLength(schemaPath.phone, 5);
    minLength(schemaPath.address, 5);
    email(schemaPath.email);
    minLength(schemaPath.imageUrl, 10);
  });

  readonly precompletarFormulario = effect(()=> {
    if(this.contact()){
      this.formModel.set({
        firstName: this.contact()!.firstName || '',
        lastName: this.contact()!.lastName || '',
        phone: this.contact()!.phone || '',
        company: this.contact()!.company || '',
        address: this.contact()!.address || '',
        email: this.contact()!.email || '',
        description: this.contact()!.description || '',
        imageUrl: this.contact()!.imageUrl || '',
      });
    }
  })

  /** Guarda los cambios */
  save(){
    submit(this.contactForm, async () => {
      const contact:NewContact|Contact = this.contact() || {...CONTACTO_NUEVO_VACIO};
      const values = this.formModel();
      contact.firstName = values.firstName;
      contact.lastName = values.lastName;
      contact.phone = values.phone;
      contact.company = values.company;
      contact.description = values.description;
      contact.address = values.address;
      contact.email = values.email;
      contact.imageUrl = values.imageUrl;
      if(!(contact as Contact).id){
        //Creación de contacto
        const res = await this.contactsService.createContact(contact);
        if(res.success && res.data) {
          //Éxito creando contacto
          this.snackBarService.openSnackbarSuccess(res.message);
          this.router.navigate(['/contacts',res.data.id]);
          if (this.dialogRef) this.dialogRef.close()
        }
        else {
          //Error creando contacto
          this.snackBarService.openSnackbarError(res.message);
        }
      } else {
        //Edición de contacto
        const res = await this.contactsService.updateContact(contact as Contact);
        if(res.success && res.data){
          //Éxito editando contacto
          this.snackBarService.openSnackbarSuccess(res.message);
          if (this.dialogRef) this.dialogRef.close()
        } else {
          //Error editando contacto
          this.snackBarService.openSnackbarError(res.message);
        }
      }
      this.dialogRef?.close()
    });
  }
}
