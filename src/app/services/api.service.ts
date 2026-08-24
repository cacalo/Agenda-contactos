import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoadingService } from './loading.service';


@Service()
export class ApiService {
  readonly loadingService = inject(LoadingService);

  /** Realiza un GET autenticado a nuestro backend */
  async get(URI:string){
    const token = localStorage.getItem("token");
    let headers:HeadersInit = {}
    if(token) headers = {...headers, Authorization: "Bearer "+token };
    this.loadingService.addLoad(URI);
    try{
      const res = await fetch(environment.API_URL+URI,{
        headers
      })
      this.loadingService.deleteLoad(URI);
      return res; 
    }
    catch {
      this.loadingService.deleteLoad(URI);
      return null
    }
  }

  /** Realiza un POST autenticado a nuestro backend */
  async post(URI:string,body:any){
    if(typeof body !== "object" && typeof body !== "string") return;
    const token = localStorage.getItem("token");
    let headers:HeadersInit = { "content-type" : "Application/json" }
    if(token) headers = {...headers, Authorization: "Bearer "+token };
    this.loadingService.addLoad(URI);
    try{
      const res = await fetch(environment.API_URL+URI,{
        method: "POST",
        headers,
        body: typeof body === "string" ? body : JSON.stringify(body),
      })
      this.loadingService.deleteLoad(URI);
      return res;
    } catch {
      this.loadingService.deleteLoad(URI);
      return null
    }
  }

  /** Realiza un PUT autenticado a nuestro backend */
  async put(URI:string,body?:any){
    // if(typeof body !== "object" && typeof body !== "string") return;
    const token = localStorage.getItem("token");
    let headers:HeadersInit = { "content-type" : "Application/json" }
    if(token) headers = {...headers, Authorization: "Bearer "+token };
    this.loadingService.addLoad(URI);
    try{
      const res = await fetch(environment.API_URL+URI,{
        method: "PUT",
        headers,
        body: typeof body === "string" ? body : JSON.stringify(body),
      })
      this.loadingService.deleteLoad(URI);
      return res;
    }
    catch {
      this.loadingService.deleteLoad(URI);
      return null
    }
  }

  /** Realiza un DELETE autenticado a nuestro backend */
  async delete(URI:string){
    const token = localStorage.getItem("token");
    let headers:HeadersInit = {}
    if(token) headers = {...headers, Authorization: "Bearer "+token };
    this.loadingService.addLoad(URI);
    try{
      const res = await fetch(environment.API_URL+URI,{
        method: "DELETE",
        headers,
      })
      this.loadingService.deleteLoad(URI);
      return res;
    } catch {
      this.loadingService.deleteLoad(URI);
      return null
    }
  }
  
}
