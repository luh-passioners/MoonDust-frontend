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

const state = ref({
  orgs: [] as IOrg[],
  transactions: [] as ITransaction[]
});

const refresh = async () => {
  state.value = {
    orgs: await fetchOrgs(),
    transactions: await fetchTransactions(),
  };
};

onMounted(() => refresh());

const orgs = computed(() => state.value?.orgs || []);

const transactionFilters = reactive({
  type: "All",
  org: "all",
});

const sortedTransactions = computed(() => (state.value?.transactions || []).toSorted((a, b) => a.date.localeCompare(b.date)));

const filteredTransactions = computed(() => sortedTransactions.value.filter(t => {
  // org filter fails
  if (transactionFilters.org !== t.org_id && transactionFilters.org !== "all") {
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
  org: "all",
});

const getOrgById = (id: string) => {
  return orgs.value.find(x => x._id === id) as IOrg;
};

const scatterData = shallowRef<any>({});
const barData = shallowRef<any>({});
const barOptions = shallowRef<any>({});

//@ts-ignore
window._barData = barData; window._orgs = orgs; window._state = state;

watchEffect(() => {
  let cumulativeSum = 0;
  const cumulativeTransactions: Point[] = [];
  const incomingTransactionsByOrg: Record<string, number> = {};
  const outgoingTransactionsByOrg: Record<string, number> = {};

  // Populate balance vs. time graph:
  sortedTransactions.value.forEach(t => {
    console.log(t.org_id, graphFilters.org);
    if (t.org_id === graphFilters.org || graphFilters.org === "all") {
      cumulativeSum += t.amount;
      const x = Number(new Date(t.date));
      const dupe = cumulativeTransactions.length > 0 && 
        cumulativeTransactions[cumulativeTransactions.length - 1].x === x;

      if (dupe) {
        cumulativeTransactions.pop();
      }

      cumulativeTransactions.push({
        x,
        y: cumulativeSum,
      });
    }
  });

  orgs.value.forEach(o => {
    incomingTransactionsByOrg[o._id] = 0;
    outgoingTransactionsByOrg[o._id] = 0;
  });

  // Populate organization histogram
  sortedTransactions.value.forEach(t => {
    if (t.amount > 0) {
      incomingTransactionsByOrg[t.org_id] = (incomingTransactionsByOrg[t.org_id] || 0) + t.amount;
    } else {
      outgoingTransactionsByOrg[t.org_id] = (outgoingTransactionsByOrg[t.org_id] || 0) + t.amount;
    }
  });


  scatterData.value = useFinancesBalanceVsTimeData(cumulativeTransactions);

  const indexOrgNameMap: Record<number, string> = {};
  const incomingOrgTransList: number[] = [];
  const outgoingOrgTransList: number[] = [];

  let i = 0;
  for (let orgId of Object.keys(incomingTransactionsByOrg)) {
    indexOrgNameMap[i] = orgs.value.find(x => x._id === orgId)?.name || "N/A";
    incomingOrgTransList.push(incomingTransactionsByOrg[orgId]);
    outgoingOrgTransList.push(outgoingTransactionsByOrg[orgId]);
    i += 1;
  }

  console.log({ incomingTransactionsByOrg, outgoingTransactionsByOrg, indexOrgNameMap, incomingOrgTransList, outgoingOrgTransList });

  barData.value = useFinancesByOrganizationData(incomingOrgTransList, outgoingOrgTransList);
  barOptions.value = useFinancesByOrganizationOptions(indexOrgNameMap);
});

const addTransactionParams = reactive({
  org_id: "all",
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

  refresh();
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
                  <select class="form-select" v-model="addTransactionParams.org_id" required>
                    <option v-for="org of orgs" :key="org._id" :value="org._id">{{ org.name }}</option>
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
                <option value="all" v-if="user?.type === 'full'">All</option>
                <option v-for="org of orgs" :key="org._id" :value="org._id">{{ org.name }}</option>
              </select>
            </div>
          </div>
          <hr>

          <div style="max-height: 50vh; overflow-y: scroll;" class="pe-3">
            <TransactionCard v-for="(t, i) of filteredTransactions.toReversed()" :orgName="getOrgById(t.org_id)?.name" :transaction="t" :key="i" />
            <p v-if="filteredTransactions.length === 0" class="lead text-center">No transactions yet; log one above.</p>
          </div>
        </LuhCard>
      </div>

      <div>
        <LuhCard title="Balance vs. time" text="Visualize how your balances has changed over time.">
          <div class="mb-4">
            <small class="fw-bold">Organization</small>
            <select class="form-select" v-model="graphFilters.org">
              <option value="all">All</option>
              <option v-for="org of orgs" :key="org._id" :value="org._id">{{ org.name }}</option>
            </select>
          </div>
          <p v-if="sortedTransactions.length === 0" class="lead text-center">Log a transaction to enable data visualization.</p>
          <Scatter v-else :data="scatterData" :options="financesBalanceVsTimeOptions" />
        </LuhCard>

        <LuhCard class="mt-4" title="Transactions by organization"
          text="See incoming/outgoing balance changes by organization.">
          <p v-if="sortedTransactions.length === 0" class="lead text-center">Log a transaction to enable data visualization.</p>
          <Bar v-else :data="barData" :options="barOptions" />
        </LuhCard>
      </div>
    </div>
  </div>
</template>