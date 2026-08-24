import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDividerModule} from '@angular/material/divider';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { GroupsService } from '../../services/groups.service';
import { GroupNewEditComponent } from '../../components/dialogs/group-new-edit/group-new-edit.component';
import { ContactsService } from '../../services/contacts.service';
import {MatTooltip} from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-logged',
  imports: [RouterOutlet,HeaderComponent,MatSidenavModule,RouterModule, MatButtonModule, MatIconModule,MatDividerModule,MatTooltip],
  templateUrl: './logged.component.html',
  styleUrl: './logged.component.scss'
})
export class LoggedComponent implements OnInit {
   readonly authService=inject(AuthService);
  readonly expanded=signal(false);
  readonly groupsService = inject(GroupsService);
  readonly dialog = inject(MatDialog);
  readonly contactsService = inject(ContactsService);
  readonly router = inject(Router);
  readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    //Escucho eventos de navigationEnd para ver si estoy dentro de la pantalla de un contacto
    this.checkIfInContactDetails(this.router.url)
    this.router.events.subscribe(e => {
      if(e.type === 1) {
        this.checkIfInContactDetails(e.urlAfterRedirects)
      }
    })
  }

  openCreateGroupModal(){
    this.dialog.open(GroupNewEditComponent)
  }

  /** Exporta contactos generales o de grupo */
  async export(){
    if(this.router.url === "/contacts"){
      this.contactsService.export();
    } else {
      const urlSplit = this.router.url.split("/");
      const idGroup = urlSplit[urlSplit.length-1];
      if(parseInt(idGroup)) this.groupsService.export(parseInt(idGroup))
    }
  }

  /** Revisa si una URL pertenece a una página de detalle de contacto */
  checkIfInContactDetails(url:string){
    const urlSplit = url.split("/");
    if(urlSplit[1] === "contacts" && urlSplit.length>2) this.showExport.set(false)
    else this.showExport.set(true)
  }
  
  /** Dice si mostramos el botón de exportar o no */
  readonly showExport = signal(true);
}
