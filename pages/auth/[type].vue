<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const isSignup = route.params.type === "signup";

const formData = reactive({
  company: "",
  username: "",
  name: "",
});
</script>

<template>
  <div class="container py-4" style="max-width: 768px;">
    <h1 class="h1 fw-max text-center">{{ isSignup ? "Get your organization started!" : "Login to access FMS." }}</h1>
    <LuhCard class="my-4" :title="isSignup ? 'Sign up' : 'Login'" text="Enter your credentials below.">
      <form @submit.prevent>
        <div class="d-flex flex-column my-4" v-if="isSignup">
          <b class="form-label">Your Company's Name</b>
          <input class="form-control" required>
        </div>

        <div class="d-flex flex-column my-4">
          <b class="form-label">Email (Your Username)</b>
          <input class="form-control" type="email" required>
        </div>

        <div class="d-flex flex-column my-4" v-if="isSignup">
          <b class="form-label">Full Name</b>
          <input class="form-control" required>
        </div>

        <div class="d-flex flex-column my-4">
          <b class="form-label">Password</b>
          <input class="form-control" type="password" required>
        </div>
      </form>

      <button class="btn btn-success">{{ isSignup ? "Get started!" : "Continue" }}</button>
    </LuhCard>
  </div>
</template>