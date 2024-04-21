<script setup lang="ts">
import type { Point } from "chart.js";
import { Scatter, Bar } from "vue-chartjs";

definePageMeta({
  middleware: "auth",
});

const user = useUser();

const fetchTransactions = async () => {
  const res = await api<{
    success: boolean;
    transactions: ITransaction[];
  }>("GET")("/transactions");

  if (res.success) {
    return res.transactions;
  } else {
    return [];
  }
};

const fetchOrgs = async () => {
  const res = await api<{
    success: boolean;
    orgs: IOrg[];
  }>("GET")("/orgs");

  if (res.success) {
    return res.orgs;
  } else {
    return [];
  }
};

const state = await useAsyncData<{
  transactions: ITransaction[];
  orgs: IOrg[];

}>("finances", async () => {
  return {
    transactions: await fetchTransactions(),
    orgs: await fetchOrgs(),
  };
});

const orgs = computed(() => state.data.value?.orgs || []);

const transactionFilters = reactive({
  type: "All",
  org: -1,
});

const sortedTransactions = computed(() => (state.data.value?.transactions || []).toSorted((a, b) => a.date.localeCompare(b.date)));

const filteredTransactions = computed(() => sortedTransactions.value.filter(t => {
  // org filter fails
  if (transactionFilters.org !== t.orgId && transactionFilters.org !== -1) {
    return false;
  }

  // wrong type
  if (transactionFilters.type === "Incoming" && t.amount < 0) {
    return false;
  }

  // wrong type
  if (transactionFilters.type === "Outgoing" && t.amount > 0) {
    return false;
  }

  return true;
}));

const graphFilters = reactive({
  org: -1,
});

const scatterData = shallowRef<any>({});
const barData = shallowRef<any>({});

watchEffect(() => {
  let cumulativeSum = 0;
  const cumulativeTransactions: Point[] = [];
  const incomingTransactionsByOrg: number[] = [];
  const outgoingTransactionsByOrg: number[] = [];

  // Populate balance vs. time graph:
  sortedTransactions.value.forEach(t => {
    if (t.orgId === graphFilters.org || graphFilters.org === -1) {
      cumulativeSum += t.amount;
      cumulativeTransactions.push({
        x: Number(new Date(t.date)),
        y: cumulativeSum,
      });
    }
  });

  // Populate organization histogram
  for (let i = 0; i < getOrgsLength(); i += 1) {
    incomingTransactionsByOrg.push(0);
    outgoingTransactionsByOrg.push(0);
  }

  sortedTransactions.value.forEach(t => {
    if (t.amount > 0) {
      incomingTransactionsByOrg[t.orgId] += t.amount;
    } else {
      outgoingTransactionsByOrg[t.orgId] += t.amount;
    }
  });

  scatterData.value = useFinancesBalanceVsTimeData(cumulativeTransactions);

  barData.value = useFinancesByOrganizationData(incomingTransactionsByOrg, outgoingTransactionsByOrg);
});

const addTransactionParams = reactive({
  orgId: -1,
  amount: 0,
  name: "",
  date: "",
});

async function addTransaction() {
  const res = await api<{
    success: boolean;
  }>("POST")("/transactions", { ...addTransactionParams });

  if (!res.success) {
    alert("Error adding the transaction. Retry a bit later?");
  }

  state.refresh();
}

const syncTransactions = reactive({
  url: "",
});
</script>

<template>
  <div class="container py-4">
    <NuxtLink to="/app" class="d-inline-block link-underline link-underline-opacity-0 mb-2">← Return to Dashboard
    </NuxtLink>
    <h1 class="fw-max h1">Finances Manager</h1>

    <div class="my-4 app-grid gap-4">
      <div>
        <LuhCard class="mb-4" title="Add a transaction" text="There are multiple ways to add transaction information to FMS.">
          <p class="lead text-center" v-if="orgs.length === 0">No organizations. <NuxtLink to="/app/admin">Add one!</NuxtLink></p>
          <template v-else>
            <details class="border px-3 py-2 rounded my-2">
              <summary>
                <p class="d-inline card-text">Log a transaction manually.</p>
              </summary>

              <form @submit.prevent="addTransaction">
                <div class="my-2">
                  <small class="fw-bold">Caption</small>
                  <input class="form-control" type="text" v-model="addTransactionParams.name" required>
                </div>

                <div class="my-2">
                  <small class="fw-bold">Organization</small>
                  <select class="form-select" v-model="addTransactionParams.orgId" required>
                    <option v-for="org of orgs" :key="org._id" :value="org.name">{{ org.name }}</option>
                  </select>
                </div>
                <div class="my-2">
                  <small class="fw-bold">Amount</small>
                  <input class="form-control" type="number" v-model="addTransactionParams.amount" step="0.01" required>
                </div>

                <div class="my-2">
                  <small class="fw-bold">Date</small>
                  <input type="date" v-model="addTransactionParams.date" class="form-control" required>
                </div>

                <button class="btn btn-success my-2" type="submit">Add transaction</button>
              </form>
            </details>

            <details class="border px-3 py-2 rounded my-2">
                <summary>
                  <p class="card-text d-inline">Sync your account balance with FMS.</p>
                </summary>

                <form @submit.prevent>
                    <div class="my-2">
                      <small class="fw-bold">Polling URL</small>
                      <input class="form-control" type="text" v-model="syncTransactions.url">
                    </div>
                  <button class="btn btn-success my-2">Setup balance sync</button>
                </form>
            </details>
          </template>
        </LuhCard>

        <LuhCard title="Preview Transactions" text="View and sort through your incoming and outgoing transactions.">
          <div class="gap-3" style="display: grid; grid-template-columns: 1fr 1fr;">
            <div>
              <small class="fw-bold">Type</small>
              <select class="form-select" v-model="transactionFilters.type">
                <option value="All">All</option>
                <option value="Incoming">Incoming</option>
                <option value="Outgoing">Outgoing</option>
              </select>
            </div>
            <div>
              <small class="fw-bold">Organization</small>
              <select class="form-select" v-model="transactionFilters.org">
                <option :value="-1" v-if="user?.type === 'full'">All</option>
                <option v-for="org of orgs" :key="org._id" :value="org.name">{{ org.name }}</option>
              </select>
            </div>
          </div>
          <hr>

          <div style="max-height: 50vh; overflow-y: scroll;" class="pe-3">
            <TransactionCard v-for="(t, i) of filteredTransactions.toReversed()" :transaction="t" :key="i" />
            <p v-if="filteredTransactions.length === 0" class="lead text-center">No transactions yet; log one above.</p>
          </div>
        </LuhCard>
      </div>

      <div>
        <LuhCard title="Balance vs. time" text="Visualize how your balances has changed over time.">
          <div class="mb-4">
            <small class="fw-bold">Organization</small>
            <select class="form-select" v-model="graphFilters.org">
              <option :value="-1">All</option>
              <option v-for="org of orgs" :key="org._id" :value="org.name">{{ org.name }}</option>
            </select>
          </div>
          <p v-if="filteredTransactions.length === 0" class="lead text-center">Log a transaction to enable data visualization.</p>
          <Scatter v-else :data="scatterData" :options="financesBalanceVsTimeOptions" />
        </LuhCard>

        <LuhCard class="mt-4" title="Transactions by organization"
          text="See incoming/outgoing balance changes by organization.">
          <p v-if="filteredTransactions.length === 0" class="lead text-center">Log a transaction to enable data visualization.</p>
          <Bar v-else :data="barData" :options="financesByOrganizationOptions" />
        </LuhCard>
      </div>
    </div>
  </div>
</template>