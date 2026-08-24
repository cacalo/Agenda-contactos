import { Service, signal } from '@angular/core';

@Service()
export class TitleService {
  /** Señal que guarda modifica el título del header de la aplicación */
  readonly title = signal("Agenda");
}
