import { Component, computed, effect, inject, input, resource, ResourceRef } from '@angular/core';
import { ContactsService } from '../../services/contacts.service';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Contact } from '../../interfaces/contact';
import { SnackBarService } from '../../services/snack-bar.service';
import { GroupsService } from '../../services/groups.service';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import { TitleService } from '../../services/title.service';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ContactNewEditComponent } from '../../components/dialogs/contact-new-edit/contact-new-edit.component';
import { DeleteComponent } from '../../components/dialogs/delete/delete.component';

@Component({
  selector: 'app-contact-info',
  imports: [NgOptimizedImage, RouterModule, MatButtonModule, MatIconModule, MatChipsModule, MatCardModule, MatTooltipModule, MatMenuModule],
  templateUrl: './contact-info.component.html',
  styleUrl: './contact-info.component.scss'
})
export class ContactInfoComponent {

  readonly contactsService = inject(ContactsService);
  readonly groupsService = inject(GroupsService);
  readonly snackBarService = inject(SnackBarService)
  readonly id = input.required<number>();
  readonly currentGroups = computed(()=> this.groupsService.groups.value()?.filter(grupo => this.contact.value()?.groupIds.includes(grupo.id)))
  readonly router = inject(Router);
  readonly titleService = inject(TitleService);
  readonly dialog = inject(MatDialog);

  /** Datos del contacto actual */
  readonly contact:ResourceRef<Contact | undefined> = resource({
      params: ()=>  ({contactId: this.id()}),
      loader: async({params})=> {
        const res = await this.contactsService.getById(params.contactId)
        if(res.success && res.data) return res.data;
        this.snackBarService.openSnackbarError(res.message);
        return
      }
    })

    /** Cambia el título cuando cambian los datos del contacto */
    readonly changeTitle = effect(()=> {
      if(this.contact.hasValue()) this.titleService.title.set(`${this.contact.value()!.firstName} ${this.contact.value()!.lastName}` )
    })
    

    /** Marca y desmarca como favorito al contacto actual */
    toggleFavorite(){
      this.contact.value.set({...this.contact.value()!, isFavorite:!this.contact.value()!.isFavorite })
      this.contactsService.toggleFavorite(this.id()).then((res)=> {
        if(!res || !res.success){
          // Vuelvo el cambio atrás si no pude marcar como favorito
          this.contact.value.set({...this.contact.value()!, isFavorite:!this.contact.value()!.isFavorite })
          this.snackBarService.openSnackbarError("Error cambiando el estado de favorito");
        }
        this.contactsService.updateLocalContact(this.contact.value()!);
      }).catch((err)=> {
        // Vuelvo el cambio atrás si no pude marcar como favorito
        this.contact.value.set({...this.contact.value()!, isFavorite:!this.contact.value()!.isFavorite })
        this.snackBarService.openSnackbarError("Error cambiando el estado de favorito");
      })
    }

    /** Elimina al contacto actual */
    async delete(){
      console.log("BORRANDO CONTACTO")
      const res = await this.contactsService.deleteContact(this.id())
      console.log(res)
      
    }

    /** Agrega o elimina el contacto de un grupo */
    async toggleGroup(groupId:number){
      const res = await this.groupsService.toogleContactOnGroup(this.contact.value()!.id,groupId);
      this.contact.reload();
    }

    showEditDialog(){
      this.dialog.open(ContactNewEditComponent,{data:this.contact.value()})
    }
    
    showDeleteDialog(){
      this.dialog.open(DeleteComponent,{data:{resource:"contacto"}}).afterClosed().subscribe(async (resDialog) =>  {
        if(resDialog) {
          const res = await this.contactsService.deleteContact(this.contact.value()!.id);
          if(res.success){
            this.router.navigate(['/']);
          }
        }
      })
    }

}
