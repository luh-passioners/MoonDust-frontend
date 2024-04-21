export default defineNuxtRouteMiddleware(() => {
  const token = useToken();

  if (token.value === null) {
    return navigateTo("/auth/login");
  }
});