export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  const publicPages = ['/login', '/unauthorized']
  if (!loggedIn.value && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }
})
