<script setup lang="ts">
import { Scatter, Bar } from "vue-chartjs";
import { Chart, LinearScale, PointElement, LineElement, Legend, type ChartData, type Point, CategoryScale, BarElement, Tooltip } from "chart.js";

Chart.defaults.font.family = "Inter";
Chart.register(LinearScale, PointElement, LineElement, CategoryScale, BarElement, Tooltip, Legend);

const graphLists = reactive({
  cumulativeSum: 0,
  cumulativeTransactions: [] as Point[],
  incomingTransactionsByOrg: [] as number[],
  outgoingTransactionsByOrg: [] as number[]
});

watchEffect(() => {
  // Reset graphLists:
  graphLists.cumulativeSum = 0;
  graphLists.cumulativeTransactions.length = 0;
  graphLists.incomingTransactionsByOrg.length = 0;
  graphLists.outgoingTransactionsByOrg.length = 0;

  // Populate balance vs. time graph:
  getTransactions().forEach(t => {
    graphLists.cumulativeSum += t.amount;

    graphLists.cumulativeTransactions.push({
      x: Number(new Date(t.date)),
      y: graphLists.cumulativeSum,
    });
  });

  // Populate organization histogram
  for (let i = 0; i < getOrgsLength(); i += 1) {
    graphLists.incomingTransactionsByOrg.push(0);
    graphLists.outgoingTransactionsByOrg.push(0);
  }

  getTransactions().forEach(t => {
    if (t.amount > 0) {
      graphLists.incomingTransactionsByOrg[t.orgId] += t.amount;
    } else {
      graphLists.outgoingTransactionsByOrg[t.orgId] += t.amount;
    }
  });
});

const scatterData = computed<ChartData<"scatter", (number | Point | null)[], unknown>>(() => ({
  datasets: [{
    label: "Balance vs. time",
    data: graphLists.cumulativeTransactions,
    backgroundColor: "blue",
    showLine: true,
  }],
}));

const scatterOptions = {
  scales: {
    x: {
      ticks: {
        callback(value: number) {
          const fmt = (s: number) => (s % 1000).toLocaleString("en-US", { minimumIntegerDigits: 2 });

          const d = new Date(value);
          let month = d.getMonth();
          month = month == 0 ? 12 : month;

          return `${fmt(month)}/${fmt(d.getDate())}/${fmt(d.getFullYear())}`;
        }
      }
    },
    y: {
      ticks: {
        callback(value: number) {
          return (value < 0 ? "-" : "") + "$" + Math.abs(value);
        }
      }
    }
  }
};

interface ExtendedDataPoint {
  [key: string]: string | number | null | ExtendedDataPoint;
}

const barData = computed<ChartData<"bar", (number | [number, number] | null)[] | ExtendedDataPoint[], unknown>>(() => ({
  labels: graphLists.incomingTransactionsByOrg.map((t, i) => getOrgById(i)),
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
}));
</script>

<template>
  <div class="container py-4">
    <NuxtLink to="/app" class="d-inline-block link-underline link-underline-opacity-0 mb-2">← Return to Dashboard
    </NuxtLink>
    <h1 class="fw-max h1">Finances Manager</h1>

    <div class="my-4 app-grid gap-4">
      <div>
        <LuhCard title="Transactions" text="View and sort through your incoming and outgoing transactions.">
          <div class="mb-3 d-flex gap-2">
            <button class="btn btn-sm btn-primary">Add transaction</button>
            <button class="btn btn-sm btn-success">Setup sync</button>
          </div>

          <div class="gap-3" style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
            <div>
              <small class="fw-bold">Type</small>
              <select class="form-select">
                <option value="All">All</option>
                <option value="Incoming">Incoming</option>
                <option value="Outgoing">Outgoing</option>
              </select>
            </div>
            <div>
              <small class="fw-bold">Organization</small>
              <select class="form-select">
                <option value="All">All</option>
                <option value="Twizz">Twizz Org</option>
              </select>
            </div>
            <div>
              <small class="fw-bold">Product</small>
              <select class="form-select">
                <option value="All">All</option>
                <option value="Spotify">Spotify</option>
                <option value="AWS">AWS</option>
              </select>
            </div>
          </div>
          <hr>

          <div style="max-height: 50vh; overflow-y: scroll;" class="pe-3">
            <TransactionCard v-for="(t, i) of getTransactions().toReversed()" :transaction="t" :key="i" />

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
            <select class="form-select">
              <option value="All">All</option>
              <option value="Twizz">Twizz Org</option>
            </select>
          </div>
          <Scatter :data="scatterData"  :options="scatterOptions" />
        </LuhCard>

        <LuhCard class="mt-4" title="Transactions by organization"
          text="See incoming/outgoing balance changes by organization.">
          <Bar :data="barData" />
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