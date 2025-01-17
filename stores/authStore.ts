

import { defineStore } from 'pinia'
import type { User } from '~/types/user'
const utf8ToB64 = (str:string) => {
    return window.btoa(unescape(encodeURIComponent(str)))
}


export const useAuthStore = defineStore('useAuthStore', {
    state: () => ({
        user: null as User | null,
        accessToken: null as string| null,
        refreshToken: null as string|null,
      }),
      getters:{
        isAuthenticated: (state) => state.accessToken !== null
      },
      actions: {
        setAccessToken(accessToken:string){
            this.accessToken = accessToken
        },
        setUser(user : User, accessToken: string, refreshToken: string) {
            this.user = user
            this.accessToken = accessToken
            this.refreshToken = refreshToken
            this.saveStateToLocalStorage()
        },
      
       
       async addReferralCode(ambassadorId:string,referralCode:string){
            const response :any = await useApi(`/business/v4/ambassadors/${ambassadorId}/codes`, {
                method:"POST",
                body:{
                    code:referralCode
                }
            })
            return response.data
        },
        async getUser(){
            const response :any = await useApi('/business/v4/ambassadors/{ambassador_id}', {
                method:"GET",
                headers: {
                    // Authorization: `Basic ${data}`
                }
            })
            return response.data
        },
        async login(credentials: { email: string; password: string }) {
            try {
                
                // Use the centralized base URL from runtime config
                const data = utf8ToB64(`${credentials.email}:${credentials.password}`)
                const response :any = await useApi('/registry/v4/sessions', {
                    method:"POST",
                    headers: {
                        Authorization: `Basic ${data}`
                    }
                })
                var user:Record<string, any> = response.data.user as Record<string, any>
                delete user.devices
                
                this.setUser(user as User, response.data.access_token, response.data.refresh_token)

                
            } catch (error) {
                console.error('Login error:', error)
                throw error
            }
        },
        // async loginWithGoogle(){
        //     try {
        //         const { googleSignIn } = useFirebaseAuth()
        //         const { accessToken, error, refreshToken } = await googleSignIn()

        //         if(error){
        //             throw error
        //         }
        //         // Use the centralized base URL from runtime config
        //         const response :any = await useApi('/registry/v4/sessions', {
        //             method:"POST",
        //             headers: {
        //                 Authorization: `Bearer ${accessToken}`
        //             }
        //         })
        //         var user:Record<string, any> = response.data.user as Record<string, any>
        //         delete user.devices
        //         this.sessionId = response.data._id;
        //         this.setUser(user as User, response.data.access_token, response.data.refresh_token)
        //         try {
        //              this.getAmbassador(user._id)
                    
        //         } catch (error) {
        //             console.log(error);
                    
        //         }
        //     } catch (error) {
        //         console.error('Login error:', error)
        //         throw error
        //     }
        // },
        async register(credentials: { email: string; password: string,first_name?:string, last_name?:string }) {
            try {

                const guestResponse :any = await useApi('/registry/v4/sessions', {
                    method:"POST",
                    headers: {
                        Authorization: `Basic guest`
                    }
                })
                
                // Use the centralized base URL from runtime config
                const response :any = await useApi('/registry/v4/users', {
                    method:"POST",
                    body:credentials,
                    headers: {
                        Authorization: `Bearer ${guestResponse.data.access_token}`
                    }
                })
                
            } catch (error) {
                console.error('register error:', error)
                throw error
            }
        },
       
        logout(){
            this.$reset()
            this.saveStateToLocalStorage()
        },
        loadStateFromLocalStorage(){
           try{
            this.user =  JSON.parse(localStorage.getItem('auth/user') as string) as User
            this.accessToken = localStorage.getItem('auth/accessToken') as string
            this.refreshToken = localStorage.getItem('auth/refreshToken') as string
           }catch(err){

           }
        },
        saveStateToLocalStorage() {
           
           if (this.user ) {
               localStorage.setItem('auth/user', JSON.stringify(this.user)) 
           }else{
                localStorage.removeItem('auth/user')
           }
           if (this.accessToken) {
               localStorage.setItem('auth/accessToken', this.accessToken)
           }else{
                localStorage.removeItem('auth/accessToken')
           }
           if (this.refreshToken) {
               localStorage.setItem('auth/refreshToken', this.refreshToken)
           }else{
                localStorage.removeItem('auth/refreshToken')
           }
           
        }
      },

      hydrate(state, initialState) {
        // in this case we can completely ignore the initial state since we
        // want to read the value from the browser
        state.user = useLocalStorage('auth/user', null).value
        state.accessToken = useLocalStorage('auth/accessToken', null).value
        state.refreshToken = useLocalStorage('auth/refreshToken', null).value
      },
})
