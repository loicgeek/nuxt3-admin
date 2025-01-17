export const useRedirectToStore = defineStore('useRedirectToStore',
    {
        state () {
            return {
                name: null as string | null,
                params: undefined as Record<string, any> | undefined,
                query: undefined as Record<string, any> | undefined
            }
        },
        actions: {
            shouldLogin (shouldSetRedirect = true, query?:Record<string, any>) {
                const route = useRoute()
                if (route.path === '/auth/login') {
                    return
                }
                useAuthStore().$reset()
                if (shouldSetRedirect) {
                    this.setRedirect(route.name?.toString(), route.query, route.params)
                }
                navigateTo({ path: 'auth/login', query })
            },
            setRedirect (to?:any, query?: Record<string, any>
                , params?: Record<string, any>) {
                if (to) {
                    this.name = to
                    this.query = query
                    this.params = params
                } else {
                    this.name = null
                    this.query = undefined
                    this.params = undefined
                }
                this.saveStateToLocalStorage()
            },
            reset () {
                this.name = null
                this.query = undefined
                this.params = undefined
            },
            doRedirect () {
                try {
                    if (this.name) {
                        const rawLocation = { name: this.name, params: this.params, query: this.query }
                        const router = useRouter()
                        const resolvedRoute = router.resolve(rawLocation)

                        
                        navigateTo({ name: this.name, params: this.params, query: this.query })
                        this.name = null
                        this.query = undefined
                        this.params = undefined
                    }
                } catch (error) {

                }
            },
            loadStateFromLocalStorage(){
                try{
                 this.name =localStorage.getItem('redirect/name')  
                 if(localStorage.getItem('redirect/params') ){
                    this.params =JSON.parse(localStorage.getItem('redirect/params') as string)  
                 }
                 if(localStorage.getItem('redirect/query')){
                    this.query =JSON.parse(localStorage.getItem('redirect/query') as string) 
                 }
                 
                }catch(err){
     
                }
             },
             saveStateToLocalStorage() {
                if (this.name) {
                    localStorage.setItem('redirect/name', this.name)
                }
                if(this.params){
                    localStorage.setItem('redirect/params', JSON.stringify(this.params))
                }
                if(this.query){
                    localStorage.setItem('redirect/query', JSON.stringify(this.query))
                }
             }
        }
    })
