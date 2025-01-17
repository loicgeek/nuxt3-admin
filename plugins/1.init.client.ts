

export default defineNuxtPlugin(async ( ) => {
    // init auth user
    const { $pinia} = useNuxtApp()
    const redirectoStore = useRedirectToStore($pinia)
    const authStore = useAuthStore($pinia)

    authStore.loadStateFromLocalStorage()
    redirectoStore.loadStateFromLocalStorage()
})
