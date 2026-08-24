import { inject, resource, ResourceRef, Service } from '@angular/core';
import { ApiService } from './api.service';
import { Contact, NewContact, ContactGetDto, ContactPostDto } from '../interfaces/contact';
import { ResponseData } from '../interfaces/responses';
import { AuthService } from './auth.service';
import { SnackBarService } from './snack-bar.service';
import { contactGetDtoToContact, contactToContactPostDto } from '../utils/maps/contactMap';
import { descargarCSV } from '../utils/CSV';

@Service()
export class ContactsService extends ApiService {
  readonly authService = inject(AuthService);
  readonly snackbarService = inject(SnackBarService);
  readonly resource = "Contacts";

  /** Recurso con todos los contactos de un usuario */
  contacts:ResourceRef<Contact[]> = resource({
    params: ()=>  ({token: this.authService.token()}),
    loader: async({params})=> {
      if(!params.token) return [];
      const res = await this.getAll();
      if(res.success && res.data) return this.sortContacts(res.data);
      this.snackbarService.openSnackbarError(res.message);
      return [];
    },
    defaultValue: []
  })

  /** Obtiene todos los contactos de un usuario del backend */
  async getAll():Promise<ResponseData<Contact[]|null>>{
    const res = await this.get(this.resource)
    if(!res || !res.ok){
      return {
        success: false,
        message: "Error buscando contactos",
      }
    }
    const resJson:ContactGetDto[] = await res.json();
    if(resJson) {
      return {
        success: true,
        message: "Contactos encontrados",
        data: resJson.map(contactRequest => contactGetDtoToContact(contactRequest)) 
      }
    }
    return {
      success: false,
      message: "Error indeterminado encontrando contactos",
    }
  }

  /** Obtiene un contacto según su ID
   * @param [skipCache=false] Indica si podemos usar el caché o si debemos recargar del server el dato del contacto
   */
  async getById(userId:number, skipCache:boolean = false):Promise<ResponseData<Contact|null>> {
    if(this.contacts.hasValue() && !skipCache){
      const contactoLocal = this.contacts.value()!.find(contact => contact.id === userId);
      if(contactoLocal) return {
        success: true,
        message: "Contacto encontrado con información local",
        data: contactoLocal
      };
    }
    const res = await this.get(`${this.resource}/${userId}`)
    if(!res || !res.ok){
      return {
        success: false,
        message: "Contacto no encontrado",
      }
    }
    const resJson:ContactGetDto = await res.json();
    if(resJson) {
      return {
        success: true,
        message: "Contacto encontrado",
        data: contactGetDtoToContact(resJson)
      }
    }
    return {
      success: false,
      message: "Error indeterminado encontrando contacto",
    }
  }

  /** Crea un nuevo contacto */
  async createContact(contact:NewContact):Promise<ResponseData<Contact>>{
    const contactPostDto:ContactPostDto = contactToContactPostDto(contact);
    const res = await this.post(this.resource,contactPostDto);
    if(!res || !res.ok){
      return {
        success: false,
        message: "Error creando contacto",
      }
    }
    const resJson:ContactGetDto = await res.json();
    if(resJson) {
      const newContact = contactGetDtoToContact(resJson);
      this.contacts.update((previous)=>  [... (previous || []),newContact]);
      return {
        success: true,
        message: "Contacto creado con éxito",
        data: newContact
      }
    }
    return {
      success: false,
      message: "Error indeterminado encontrando contacto",
    }
  }

  /** Edita datos de un contacto */
  async updateContact(contact:Contact):Promise<ResponseData<Contact>>{
    const contactPostDto:ContactPostDto = contactToContactPostDto(contact);
    const res = await this.put(this.resource+"/"+contact.id,contactPostDto);
    if(!res || !res.ok){
      return {
        success: false,
        message: "Error editando contacto",
      }
    }
    this.updateLocalContact(contact);
    return {
      success: true,
      message: "Contacto editado con éxito",
      data: contact
    }
  }

  /** Elimina a un contacto */
  async deleteContact(contactId:number):Promise<ResponseData>{
    const res = await this.delete(`${this.resource}/${contactId}`);
    if(!res || !res.ok){
      return {
        success: false,
        message: "Error eliminado contacto",
      }
    }
    this.contacts.value.set(this.contacts.value()?.filter(contact => contact.id !== contactId));
    return {
      success: true,
      message: "Contacto eliminado con éxito",
    }
  }

  /** Marca o desmarca el estado de favorito de un usuario */
  async toggleFavorite(contactId:number){
    const res = await this.post(`${this.resource}/${contactId}/favorite`,contactId);
    if(!res || !res.ok){
      return {
        success: false,
        message: "Error marcando favorito",
      }
    }
    return {
      success: true,
      message: "Cambio realizado con éxito",
    }
  }

  /** Actualiza un contacto de manera local así no tenemos que pedir la info al backend de nuevo */
  updateLocalContact(contact:Contact){
    const contactosEditados = this.contacts.value()!.map(existentContact => existentContact.id === contact.id ? contact : existentContact);
    this.contacts.value.set(this.sortContacts(contactosEditados));
  }

  /** Ordena los contactos según si es favorito y por orden alfabético */
  sortContacts(contacts:Contact[]){
    return contacts.sort((a,b)=> (a.isFavorite ? -1 : 1 ) -  (b.isFavorite ? -1 : 1 ) || a.lastName.localeCompare(b.lastName));
  }

/** Exporta un grupo en CSV */
  async export(){
    const res = await this.get(`${this.resource}/export`);
    if(!res || !res.ok){
      return {
        success: false,
        message: "Error eliminado grupo",
      }
    }
    //Generar CSV con texto
    const csvString = await res.text();
    if(!csvString) return {
      success: true,
      message: "Error exportando grupo",
    }
    const csv = descargarCSV("nombre ejemplo",csvString);
    return {
      success: true,
      message: "Grupo editado con éxito",
    }
  }
    
}
