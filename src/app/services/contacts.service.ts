import { inject, Injectable, resource, ResourceRef, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Contact } from '../interfaces/contact';
import { ResponseData } from '../interfaces/responses';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContactsService extends ApiService {
  authService = inject(AuthService)
  readonly resource = "Contact";

  // contacts = signal<Contact[]>([]);
  contacts:ResourceRef<Contact[]> = resource({
    request: ()=>  ({token: this.authService.token()}),
    loader: async({request})=> {
      if(!request.token) return [];
      const res = await this.getAll()
      if(res.success && res.data) return res.data;
      return [];
    }
  })

  async getAll():Promise<ResponseData<Contact[]|null>>{
    const res = await this.get(this.resource)
    if(!res.ok){
      return {
        success: false,
        message: "Error buscando contactos",
      }
    }
    const resJson = await res.json();
    if(resJson) {
      return {
        success: true,
        message: "Contactos encontrados",
        data: resJson
      }
    }
    return {
      success: false,
      message: "Error indeterminado encontrando contactos",
    }
  }

  async getById(userId:string):Promise<ResponseData<Contact|null>> {
    if(this.contacts.hasValue()){
      const contactoLocal = this.contacts.value()!.find(contact => contact.id);
      if(contactoLocal) return {
        success: true,
        message: "Contacto encontrado con información local",
        data: contactoLocal
      };
    }
    const res = await this.get(`${this.resource}/${userId}`)
    if(!res.status){
      return {
        success: false,
        message: "Contacto no encontrado",
      }
    }
    const resJson = await res.json();
    if(resJson) {
      return {
        success: true,
        message: "Contacto encontrado",
        data: resJson
      }
    }
    return {
      success: false,
      message: "Error indeterminado encontrando contacto",
    }
  }

  createUser(user:Contact){
    this.post(this.resource,user)
  }

  updateUser(user:Contact){
    this.put(this.resource,user)
  }

  deleteUser(userId:string){
    this.delete(`${this.resource}/${userId}`)
  }
    
}