import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { SnackBarService } from '../../../services/snack-bar.service';
import { GroupsService } from '../../../services/groups.service';
import { Group, GRUPO_VACIO, NewGroup } from '../../../interfaces/group';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-group-new-edit',
  imports: [FormField,MatFormFieldModule,MatInputModule,MatDialogModule, MatButtonModule],
  templateUrl: './group-new-edit.component.html',
  styleUrl: './group-new-edit.component.scss'
})
export class GroupNewEditComponent {
  readonly groupsService = inject(GroupsService);
  readonly router = inject(Router);
  readonly snackBarService = inject(SnackBarService)
  readonly dialogRef = inject(MatDialogRef<GroupNewEditComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  /** Input de ID, se utiliza cuando entramos a este componente con parámetros de ruta para editar un contacto */
  readonly id = input<number>();

  /** Contiene el grupo a editar */
  readonly group = computed<Group>(()=> {
    if(this.data) return this.data; //En caso de abrir este componente como un modal
    if(!this.id()) return undefined; //En caso de abrir este componente como una ruta
    return this.groupsService.groups.value()?.find(group => group.id == this.id())
  });

  /** Datos del formulario de grupo */
  readonly formModel = signal({
    name: '',
    description: '',
  });

  readonly groupForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.name, { message: 'El nombre es obligatorio' });
  });

  readonly precompletarFormulario = effect(()=> {
    if(this.group()){
      this.formModel.set({
        name: this.group()!.name || '',
        description: this.group()!.description || '',
      });
    }
  })

  /** Guarda los cambios */
  save(){
    submit(this.groupForm, async () => {
      const group:NewGroup | Group = this.group() || GRUPO_VACIO;
      const values = this.formModel();
      group.name = values.name;
      group.description = values.description;
      if(!this.group() || !this.group().id){
        //Creación de grupo
        const res = await this.groupsService.createGroup(group);
        if(res.success && res.data) {
          //Éxito creando grupo
          this.snackBarService.openSnackbarSuccess(res.message);
          this.router.navigate(['/groups',res.data.id]);
          if(this.dialogRef) this.dialogRef.close(true);
        }
        else {
          //Error creando grupo
          this.snackBarService.openSnackbarError(res.message);
        }
      } else {
        //Edición de grupo
        const res = await this.groupsService.updateGroup(group as Group);
        if(res.success && res.data){
          //Éxito editando grupo
          this.snackBarService.openSnackbarSuccess(res.message);
          this.groupsService.updateLocalGroup(res.data);
          if(this.dialogRef) this.dialogRef.close(true);
          return
        }
        //Error editando grupo
        this.snackBarService.openSnackbarError(res.message);
      }
    });
  }
}
