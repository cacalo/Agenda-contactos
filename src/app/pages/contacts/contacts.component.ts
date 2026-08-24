import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ContactsService } from '../../services/contacts.service';

import { RouterModule } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { MatButtonModule } from '@angular/material/button';
import { ContactsTableComponent } from "../../components/contacts-table/contacts-table.component";
import { TitleService } from '../../services/title.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ContactNewEditComponent } from '../../components/dialogs/contact-new-edit/contact-new-edit.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-contactos',
  imports: [RouterModule, MatButtonModule, ContactsTableComponent, MatIconModule, MatTooltip],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
  host: {height: "100%",
    "background-color":"red"}
})
export class ContactsComponent implements OnInit{

  readonly authService = inject(AuthService);
  readonly contactsService = inject(ContactsService);
  readonly groupsService = inject(GroupsService);
  readonly titleService = inject(TitleService);
  readonly dialog = inject(MatDialog);
  
  ngOnInit(): void {
    this.titleService.title.set("Agenda");
  }

  showDialogNewContact(){
      this.dialog.open(ContactNewEditComponent)
  }
  
}
