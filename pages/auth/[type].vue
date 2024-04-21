<script setup lang="ts">
const route = useRoute();

const isSignup = route.params.type === "signup";

const token = useToken();
const user = useUser();

const formData = reactive({
  company: "",
  username: "",
  name: "",
  password: "",
  type: "full"
});

async function continueSignup() {
  const response = await api<{
    success: boolean;
    token: string;
    user: IUser;
  }>("POST")("/signup", formData);

  return response;
}

async function continueLogin() {
  const response = await api<{
    success: boolean;
    token: string;
    user: IUser;
  }>("POST")("/login", formData);

  return response;
}

async function submit() {
  const response = isSignup ? await continueSignup() : await continueLogin();

  if (!response.success) {
    alert("Error authenticating you! Maybe retry later?");
  }

  token.value = response.token;
  user.value = response.user;
  
  navigateTo("/app");
}
</script>

<template>
  <div class="container py-4" style="max-width: 768px;">
    <h1 class="h1 fw-max text-center">{{ isSignup ? "Get your organization started!" : "Login to access FMS." }}</h1>
    <LuhCard class="my-4" :title="isSignup ? 'Sign up' : 'Login'" :text="isSignup ? 'Just fill out the fields below to get up and running!' : 'Enter your credentials below.'">
      <form @submit.prevent="submit">
        <div class="d-flex flex-column my-4" v-if="isSignup">
          <b class="form-label">Your Company's Name</b>
          <input class="form-control" required v-model="formData.company">
        </div>

        <div class="d-flex flex-column my-4">
          <b class="form-label">Email (Your Username)</b>
          <input class="form-control" type="email" required v-model="formData.username">
        </div>

        <div class="d-flex flex-column my-4" v-if="isSignup">
          <b class="form-label">Full Name</b>
          <input class="form-control" required v-model="formData.name">
        </div>

        <div class="d-flex flex-column my-4">
          <b class="form-label">Password</b>
          <input class="form-control" type="password" required v-model="formData.password">
        </div>

        <button class="btn btn-success" type="submit">{{ isSignup ? "Get started!" : "Continue" }}</button>
      </form>
    </LuhCard>
  </div>
</template>