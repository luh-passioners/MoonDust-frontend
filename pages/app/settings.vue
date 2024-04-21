<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const state = ref({
  orgs: [] as IOrg[]
});

const refresh = async () => {
  state.value = {
    orgs: await fetchOrgs(),
  };
};

onMounted(() => refresh());

const newOrgName = ref("");

async function addOrg() {
  const { success } = await api<{
    success: boolean;
  }>("POST")("/orgs", {
    name: newOrgName.value
  });

  if (success) {
    refresh();
  } else {
    alert("Unable to add that organization, try again later?");
  }
}
</script>

<template>
  <div class="container py-4">
    <NuxtLink to="/app" class="d-inline-block link-underline link-underline-opacity-0 mb-2">← Return to Dashboard
    </NuxtLink>
    <h1 class="fw-max h1">Settings / Admin</h1>
    <div class="my-4 app-grid gap-4">
      <div>
        <LuhCard title="Organizations" text="Manage your company's organizations to distinguish and subgroup finances.">
          <form @submit.prevent="addOrg">
            <div class="my-2">
              <small class="fw-bold">Organization Name</small>
              <input type="text" required class="form-control" v-model="newOrgName">
            </div>

            <button class="btn btn-sm btn-success my-2">Add organization</button>
          </form>

          <hr>

          <p>
            <b>Current organizations:</b>
            {{ state.orgs.map(x => x.name).join(", ") }}
          </p>
        </LuhCard>
      </div>
    </div>
  </div>
</template>