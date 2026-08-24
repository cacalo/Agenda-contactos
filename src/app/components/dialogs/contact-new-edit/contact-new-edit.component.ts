import { Component, computed, effect, inject, input } from '@angular/core';
import { ContactsService } from '../../../services/contacts.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Contact, NewContact, CONTACTO_NUEVO_VACIO } from '../../../interfaces/contact';
import { Router } from '@angular/router';
import { SnackBarService } from '../../../services/snack-bar.service';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-contact-new-edit',
  imports: [ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatButtonModule,MatDialogModule],
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
  readonly precompletarFormulario = effect(()=> {
    if(this.contact()){
      this.form.controls.firstName.setValue(this.contact()!.firstName || '');
      this.form.controls.lastName.setValue(this.contact()!.lastName || '');
      this.form.controls.phone.setValue(this.contact()!.phone || '');
      this.form.controls.company.setValue(this.contact()!.company || '');
    }
  })

  /** Guarda los cambios */
  async save(){
    const contact:NewContact|Contact = this.contact() || {...CONTACTO_NUEVO_VACIO}; 
    contact.firstName = this.form.controls.firstName.value || '';
    contact.lastName = this.form.controls.lastName.value || '';
    contact.phone = this.form.controls.phone.value || '';
    contact.company = this.form.controls.company.value || '';
    contact.description = this.form.controls.description.value || '';
    contact.address = this.form.controls.address.value || '';
    contact.email = this.form.controls.email.value || '';
    contact.imageUrl = this.form.controls.imageUrl.value || '';
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
  }

  /** Datos del formulario de contacto */
  readonly form = new FormGroup({
    firstName: new FormControl('',Validators.required),
    lastName: new FormControl(''),
    phone: new FormControl('',[Validators.required,Validators.minLength(5)]),
    company: new FormControl(''),
    address: new FormControl('',Validators.minLength(5)),
    email: new FormControl('',Validators.email),
    description: new FormControl(''),
    imageUrl: new FormControl('',Validators.minLength(10)),
  });
}
