import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { LoginData, LoginDto } from '../interfaces/login';
import { ApiService } from './api.service';
import { RegisterData } from '../interfaces/register';
import { UserPostRes, User } from '../interfaces/usuario';
import { Router } from '@angular/router';
import { ResponseData } from '../interfaces/responses';
import { decodeToken } from '../utils/token';
import { UsersService } from './users.service';
import { TokenClaims } from '../interfaces/token';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiService {

  router = inject(Router);
  userService = inject(UsersService);
  logoutTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(){
    super();
    const tokenLocalstorage = localStorage.getItem("token");
    this.token.set(tokenLocalstorage || null);
  }

  /** Obtiene información del usuario a partir del claim */
  user = computed<User|null>(()=> {
    if(!this.token()) return null;
    const tokenDecodificado = decodeToken(this.token()!);
    const user:User = {
      firstName: tokenDecodificado.given_name,
      lastName: tokenDecodificado.family_name,
      email: 'Correo',
    }
    return user;
  })

  /** Desconecto al usuario si se venció su sesión */
  vencimientoToken = effect(()=> {
    if(!this.token()) return this.logout();
    const tokenDecodificado = decodeToken(this.token()!);
    if(!tokenDecodificado.exp || new Date(tokenDecodificado.exp*1000) < new Date()){
      this.logout();
    } else {
      if(this.logoutTimer) clearTimeout(this.logoutTimer) //Frena cálculo anterior
      this.logoutTimer = setTimeout(() => {
        this.logout()
      }, tokenDecodificado.exp*1000 - new Date().getTime());
    }
  })

  // claims = computed<TokenClaims|null>(()=> {
  //   if(!this.token()) return null;
  //   return decodeToken(this.token()!);
  // })

  /** Obtiene información del usuario a partir del token */
  // user:ResourceRef<User | null> = resource({
  //   request: () => (this.token()),
  //   loader: async (request)=> {
  //     if(!this.token()) return null;
  //     const tokenDecodificado = decodeToken(this.token()!);
  //     if(!tokenDecodificado.exp || new Date(tokenDecodificado.exp) > new Date()){
  //       this.logout();
  //       return null;
  //     }
  //     return user;
  //     //Obtengo los datos del usuario pidiendo al back la información de mi usuario por mi ID
  //     if (tokenDecodificado.sub){
  //       const resUser = await this.userService.getById(tokenDecodificado.sub);
  //       if(resUser.success && resUser.data){
  //         return resUser.data
  //       }
  //     }
  //     // console.log(tokenDecodificado)
  //     return null
  //     //Obtengo los datos del usuario pidiendo al back la información de mi usuario por mi token
  //     // const res = await this.get("me");
  //     // if(res && res.ok) {
  //     //   const resJson:MeRequest = res.json()
  //     //   return resJson
  //     // }
  //     // return null
  //   },
  // });

  /** El token guardado en memoria de la aplicación */
  token = signal<string | null>(null);

  /** Actualiza el token en localstorage según lo que pasa en la app */
  guardarTokenLocalstorage = effect(()=> 
    this.token() ? 
    localStorage.setItem("token",this.token()!) :
    localStorage.removeItem("token")
  );

  /** Intenta iniciar sesión */
  async login(loginData:LoginData):Promise<ResponseData>{
    const res = await this.post("authentication/authenticate",loginData)
    if(!res) return {
      success: false,
      message: "Error de conexión"
    }
    if(res.status === 503 || res.status === 401) return{
      success: false,
      message: "Usuario o contraseña incorrectos"
    }
    if(res.ok) {
      const token = await res.text();
      if(token) this.token.set(token);
      return {
        success: true,
        message: "Sesión iniciada con éxito"
      }
    }
    return {
      success: false,
      message: "Error indeterminado"
    }
  }

  /** Desloguea a un usuario */
  logout(){
    this.token.set(null);
    this.router.navigate(["/"]);
  }

  /** Crea un nuevo usuario */
  async register(registerData:RegisterData):Promise<ResponseData<User | undefined>>{
    const params: LoginDto = {
      UserName: registerData.username,
      Password: registerData.password
    }
    const res = await this.post("authentication/authenticate", params)
    if(res && res.ok) {
      const resJson:UserPostRes = await res.json()
      if(!resJson.Id) return {
        success: false,
        message: "Error registrando usuario"
      }
      const user = resJson
      return {
        success: true,
        message: "Usuario creado con éxito",
      }
    }
    return {
      success: false,
      message: "Error creando usuario"
    }
  }


}
