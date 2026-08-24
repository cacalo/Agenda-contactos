import { Component, input } from '@angular/core';
import { Contact } from '../../interfaces/contact';
import { ContactSummaryComponent } from '../contact-summary/contact-summary.component';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-contacts-table',
  imports: [ContactSummaryComponent,MatDividerModule],
  templateUrl: './contacts-table.component.html',
  styleUrl: './contacts-table.component.scss'
})
export class ContactsTableComponent {
  readonly contacts = input.required<Contact[] | undefined>();
  readonly loading = input<boolean>(false);
}
