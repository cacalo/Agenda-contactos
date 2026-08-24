import { Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { TitleService } from '../../services/title.service';


@Component({
  selector: 'app-header',
  imports: [MatButtonModule,RouterModule, MatToolbarModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly titleService = inject(TitleService);
  readonly toggleSidebar = output();
}
