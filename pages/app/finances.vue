<script setup lang="ts">
import { Scatter, Bar } from "vue-chartjs";
import { Chart, LinearScale, PointElement, LineElement, Legend, type ChartData, type Point, CategoryScale, BarElement, Tooltip } from "chart.js";

Chart.defaults.font.family = "Inter";
Chart.register(LinearScale, PointElement, LineElement, CategoryScale, BarElement, Tooltip, Legend);

const transactionFilters = reactive({
  type: "All",
  org: -1,
});

const sortedTransactions = computed(() => getTransactions().value.toSorted((a, b) => a.date.localeCompare(b.date)));

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

const scatterData = shallowRef({});
const barData = shallowRef({});

watchEffect(() => {
  // Reset graphLists:
  const graphLists = {
    cumulativeSum: 0,
    cumulativeTransactions: [] as Point[],
    incomingTransactionsByOrg: [] as number[],
    outgoingTransactionsByOrg: [] as number[]
  };

  // Populate balance vs. time graph:
  sortedTransactions.value.forEach(t => {
    if (t.orgId === graphFilters.org || graphFilters.org === -1) {
      graphLists.cumulativeSum += t.amount;
      graphLists.cumulativeTransactions.push({
        x: Number(new Date(t.date)),
        y: graphLists.cumulativeSum,
      });
    }
  });

  // Populate organization histogram
  for (let i = 0; i < getOrgsLength(); i += 1) {
    graphLists.incomingTransactionsByOrg.push(0);
    graphLists.outgoingTransactionsByOrg.push(0);
  }

  getTransactions().value.forEach(t => {
    if (t.amount > 0) {
      graphLists.incomingTransactionsByOrg[t.orgId] += t.amount;
    } else {
      graphLists.outgoingTransactionsByOrg[t.orgId] += t.amount;
    }
  });

  scatterData.value = {
    datasets: [{
      label: "Balance vs. time",
      data: graphLists.cumulativeTransactions,
      backgroundColor: "blue",
      showLine: true,
    }],
  };

  barData.value = {
    labels: graphLists.incomingTransactionsByOrg.map((t, i) => (i)),
    datasets: [{
      label: "Incoming",
      data: graphLists.incomingTransactionsByOrg,
      backgroundColor: "green",
    },
    {
      label: "Outgoing",
      data: graphLists.outgoingTransactionsByOrg,
      backgroundColor: "red",
    }],
  };
});

const scatterOptions = {
  plugins: {
    tooltip: {
      callbacks: {
        label(context: any) {
          const fmt = (s: number) => (s % 1000).toLocaleString("en-US", { minimumIntegerDigits: 2 });

          const d = new Date(context.parsed.x);
          let month = d.getMonth();
          month = month == 0 ? 12 : month;

          const xParsed = `${fmt(month)}/${fmt(d.getDate())}/${fmt(d.getFullYear())}`;
          const yParsed = (context.parsed.y < 0 ? "-" : "") + "$" + Math.abs(context.parsed.y)
            .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          return `${yParsed} on ${xParsed}`;
        }
      }
    }
  },
  scales: {
    // x: {
    //   ticks: {
    //     callback(value: number) {
    //       const fmt = (s: number) => (s % 1000).toLocaleString("en-US", { minimumIntegerDigits: 2 });

    //       const d = new Date(value);
    //       let month = d.getMonth();
    //       month = month == 0 ? 12 : month;

    //       return `${fmt(month)}/${fmt(d.getDate())}/${fmt(d.getFullYear())}`;
    //     }
    //   }
    // },
    y: {
      ticks: {
        callback(value: number) {
          return (value < 0 ? "-" : "") + "$" + Math.abs(value)
            .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });;
        }
      }
    }
  }
};

const barOptions = {
  plugins: {
    tooltip: {
      callbacks: {
        title(context: any) {
          return "";
        },
        label(context: any) {
          const yParsed = (context.parsed.y < 0 ? "-" : "") + "$" + Math.abs(context.parsed.y)
            .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          return `${getOrgById(context.parsed.x)}: ${yParsed}`;
        }
      }
    }
  },
  scales: {
    y: {
      ticks: {
        callback(value: number) {
          return (value < 0 ? "-" : "") + "$" + Math.abs(value)
            .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });;
        }
      }
    }
  }
};

const addTransactionParams = reactive({
  orgId: -1,
  amount: 0,
  name: "",
  date: "",
});

function addTransaction() {
  getTransactions().value.push({ ...addTransactionParams });
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
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title d-flex align-items-start">
              Add Transactions
            </h5>

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
                    <option v-for="(org, i) of getOrgs()" :key="i" :value="i">{{ org }}</option>
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
          </div>
        </div>

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
                <option :value="-1">All</option>
                <option v-for="(org, i) of getOrgs()" :key="i" :value="i">{{ org }}</option>
              </select>
            </div>
          </div>
          <hr>

          <div style="max-height: 50vh; overflow-y: scroll;" class="pe-3">
            <TransactionCard v-for="(t, i) of filteredTransactions.toReversed()" :transaction="t" :key="i" />

            <div class="text-center">
              <button class="btn btn-sm btn-dark">Load more</button>
            </div>
          </div>
        </LuhCard>
      </div>

      <div>
        <LuhCard title="Balance vs. time" text="Visualize how your balances has changed over time.">
          <div class="mb-4">
            <small class="fw-bold">Organization</small>
            <select class="form-select" v-model="graphFilters.org">
              <option :value="-1">All</option>
              <option v-for="(org, i) of getOrgs()" :key="i" :value="i">{{ org }}</option>
            </select>
          </div>
          <Scatter :data="scatterData" :options="scatterOptions" />
        </LuhCard>

        <LuhCard class="mt-4" title="Transactions by organization"
          text="See incoming/outgoing balance changes by organization.">
          <Bar :data="barData" :options="barOptions" />
        </LuhCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
</style>