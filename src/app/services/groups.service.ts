import { inject, resource, ResourceRef, Service } from '@angular/core';
import { AuthService } from './auth.service';
import { SnackBarService } from './snack-bar.service';
import { Group, GroupGetDto, GroupPostDto, NewGroup } from '../interfaces/group';
import { ResponseData } from '../interfaces/responses';
import { ApiService } from './api.service';
import { groupGetDtoToGroup, groupToGroupPostDto } from '../utils/maps/groupMap';
import { descargarCSV } from '../utils/CSV';
import { ContactsService } from './contacts.service';

@Service()
export class GroupsService extends ApiService {

  readonly authService = inject(AuthService);
  readonly snackbarService = inject(SnackBarService);
  readonly resource = "Groups";
  readonly contactsService = inject(ContactsService);

  /** Recurso con todos los grupos de un usuario */
  readonly groups:ResourceRef<Group[]> = resource({
    params: ()=> ({token: this.authService.token()}),
    loader: async({params})=> {
      if(!params.token) return [];
      const res = await this.getAll();
      if(res.success && res.data) return res.data;
      this.snackbarService.openSnackbarError(res.message);
      return [];
    },
    defaultValue: []
  })

  /** Obtiene todos los grupos del backend */
  async getAll():Promise<ResponseData<Group[]|null>>{
    const res = await this.get(this.resource);
    if(!res || !res.ok){
      return {
        success: false,
        message: "Error buscando grupos",
      }
    }
    const resJson:GroupGetDto[] = await res.json();
    if(resJson) {
      return {
        success: true,
        message: "Grupos encontrados",
        data: resJson.map(contactRequest => groupGetDtoToGroup(contactRequest)) 
      }
    }
    return {
      success: false,
      message: "Error indeterminado encontrando grupos",
    }
  }
  
  /** Obtiene datos de un grupo de la memoria local */
  getByIdLocal(groupId:number):Group|undefined {
    return this.groups.value()!.find(group => group.id === groupId);
  }

  /** Obtener un sólo grupo desde su ID */
  async getById(groupId:number):Promise<ResponseData<Group|null>> {
    if(this.groups.hasValue()){
      const groupLocal = this.getByIdLocal(groupId);
      if(groupLocal) return {
        success: true,
        message: "Grupo encontrado con información local",
        data: groupLocal
      };
    }
    const res = await this.get(`${this.resource}/${groupId}`)
    if(!res || !res.ok){
      return {
        success: false,
        message: "Grupo no encontrado",
      }
    }
    const resJson:GroupGetDto = await res.json();
    if(resJson) {
      return {
        success: true,
        message: "Grupo encontrado",
        data: groupGetDtoToGroup(resJson)
      }
    }
    return {
      success: false,
      message: "Error indeterminado encontrando grupo",
    }
  }

  /** Crear un nuevo grupo en backend */
  async createGroup(group:NewGroup):Promise<ResponseData<Group>>{
    const groupPostDto:GroupPostDto = groupToGroupPostDto(group);
    const res = await this.post(this.resource,groupPostDto);
    if(!res || !res.status){
      return {
        success: false,
        message: "Error creando grupo",
      }
    }
    const resJson:GroupGetDto = await res.json();
    if(resJson) {
      const newGrupo = groupGetDtoToGroup(resJson);
      this.groups.update((previous)=>  [... (previous || []),newGrupo]);
      return {
        success: true,
        message: "Grupo creado con éxito",
        data: newGrupo
      }
    }
    return {
      success: false,
      message: "Error indeterminado encontrando contacto",
    }
  }

  /** Edita datos de un grupo en el backend */
  async updateGroup(group:Group):Promise<ResponseData<Group>>{
    const groupPostDto:GroupPostDto = groupToGroupPostDto(group);
    const res = await this.put(this.resource+"/"+group.id,groupPostDto);
    if(!res || !res.ok){
      return {
        success: false,
        message: "Error editando grupo",
      }
    }
    this.updateLocalGroup(group);
    return {
      success: true,
      message: "Grupo editado con éxito",
      data: group
    }
  }

  /** Elimina un grupo en el backend */
  async deleteGroup(groupId:number):Promise<ResponseData>{
    const res = await this.delete(`${this.resource}/${groupId}`);
    if(!res || !res.ok){
      return {
        success: false,
        message: "Error eliminado grupo",
      }
    }
    this.groups.value.set(this.groups.value()?.filter(group => group.id !== groupId));
    return {
      success: true,
      message: "Grupo eliminado con éxito",
    }
  }

  /** Exporta un grupo en CSV */
  async export(groupId:number){
    const res = await this.get(`${this.resource}/export/${groupId}`);
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

  /** Actualiza un grupo de manera local así no tenemos que pedir la info al backend de nuevo */
  updateLocalGroup(group:Group){
    const gruposEditados = this.groups.value()!.map(existentGroup => existentGroup.id === group.id ? group : existentGroup);
    this.groups.value.set(gruposEditados);
  }

  /** Agrega o borra a un contacto de un grupo */
  async toogleContactOnGroup(contactId:number,groupId:number){
    const res = await this.put(`${this.resource}/${groupId}/contact/${contactId}`);
    if(!res || !res.ok){
      return {
        success: false,
        message: "Error modificando grupo",
      }
    }
    let agregado = true;
    // Actualizo la lista de contactos dentro de la lista de grupos
    this.groups.value.update((group)=> group!.map((group => {
        if(group.id !== groupId) return group;
        const included = group.contacts.findIndex(contact => contact.id === contact.id);
        if(included) {
          group.contacts.splice(included,1);
          agregado = false;
          return group
        }
        group.contacts.push(this.contactsService.contacts.value()!.find(contact => contact.id === contactId)!);
        return group
      }))
    );
    // Actualizo los grupos dentro de la lista de contactos
    this.contactsService.contacts.value.update((contacts)=> contacts!.map(contact => {
      if(contact.id !== contactId) return contact;
      if(agregado) return {...contact, groupIds: [...contact.groupIds, groupId]}
      return {...contact, groupIds: contact.groupIds.filter(group => group !== groupId)}
    }))

    return {
      success: true,
      message: "Grupo modificado",
    }
  }
    
}
