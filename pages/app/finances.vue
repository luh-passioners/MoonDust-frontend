<script setup lang="ts">
import { Scatter, Bar } from "vue-chartjs";
import { Chart, LinearScale, PointElement, LineElement, type ChartData, type Point, CategoryScale, BarElement, Tooltip } from "chart.js";

Chart.defaults.font.family = "Inter";
Chart.register(LinearScale, PointElement, LineElement, CategoryScale, BarElement, Tooltip);

let cumulativeSum = 0;
const cumulativeTransactions: Point[] = [];

getTransactions().forEach(t => {
  cumulativeSum += t.amount;

  cumulativeTransactions.push({
    x: Number(new Date(t.date)),
    y: cumulativeSum,
  });
});

const scatterData: ChartData<"scatter", (number | Point | null)[], unknown> = {
  datasets: [{
    data: cumulativeTransactions,
    backgroundColor: "red",
    showLine: true,
  }],
};

interface ExtendedDataPoint {
    [key: string]: string | number | null | ExtendedDataPoint;
}

const incomingTransactionsByOrg: number[] = [];
const outgoingTransactionsByOrg: number[] = [];

for (let i = 0; i < getOrgsLength(); i += 1) {
  incomingTransactionsByOrg.push(0);
  outgoingTransactionsByOrg.push(0);
}

getTransactions().forEach(t => {
  if (t.amount > 0) {
    incomingTransactionsByOrg[t.orgId] += t.amount;
  } else {
    outgoingTransactionsByOrg[t.orgId] += t.amount;
  }
});

const barData: ChartData<"bar", (number | [number, number] | null)[] | ExtendedDataPoint[], unknown> = {
  labels: incomingTransactionsByOrg.map((t, i) => getOrgById(i)),
  datasets: [{
    data: incomingTransactionsByOrg,
    backgroundColor: "green",
  },
  {
    data: outgoingTransactionsByOrg,
    backgroundColor: "red",
  }],
};
</script>

<template>
  <div class="container py-4">
    <NuxtLink to="/app" class="d-inline-block link-underline link-underline-opacity-0 mb-2">← Return to Dashboard
    </NuxtLink>
    <h1 class="fw-max h1">Finances Manager</h1>

    <div class="my-4 app-grid gap-4">
      <div>
        <LuhCard title="Transactions" text="View and sort through your incoming and outgoing transactions.">
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
            <TransactionCard v-for="(t, i) of getTransactions()" :transaction="t" :key="i" />

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
          <Scatter :data="scatterData"></Scatter>
        </LuhCard>

        <LuhCard class="mt-4" title="Transactions by organization"
          text="See incoming/outgoing balance changes by organization.">
          <Bar :data="barData"></Bar>
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