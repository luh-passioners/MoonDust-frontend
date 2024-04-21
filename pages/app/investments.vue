<script setup lang="ts">
import { Scatter } from "vue-chartjs";

definePageMeta({
  middleware: "auth",
});

const state = useAsyncData<{
  positions: IPosition[];
  ranges: Record<string, TStockRange>;
}>("investments", async () => {
  const res = await api<{
    success: boolean;
    positions: IPosition[];
    ranges: Record<string, TStockRange>;
  }>("GET")("/positions");

  if (res.success) {
    return { positions: res.positions, ranges: res.ranges };
  } else {
    return { positions: [], ranges: {} };
  }
});

const positions = computed(() => state.data.value?.positions || []);
const ranges = computed(() => state.data.value?.ranges || {});

const scatterData = shallowRef<{}>();

watchEffect(() => {
  const portfolioByDate: Record<number, number> = {};
  
  for (let pos of positions.value) {
    for (let point of ranges.value[pos.ticker]) {
      const { date, price } = point;

      const added = date === pos.startDate ? pos.initialPrice : price;

      portfolioByDate[Date.parse(date)] = (portfolioByDate[Date.parse(date)] || 0) + added; 
    }
  }

  const graphPairs = Object.entries(portfolioByDate).map(([x, y]) => ({ x, y }));
  scatterData.value = useInvestmentsPortfolioOverTimeData(graphPairs);
});
</script>

<template>
  <div class="container py-4">
    <NuxtLink to="/app" class="d-inline-block link-underline link-underline-opacity-0 mb-2">
      ← Return to Dashboard
    </NuxtLink>
    <h1 class="fw-max h1">Investments Manager</h1>

    <div class="my-4 app-grid gap-4">
      <div>
        <LuhCard class="mb-4" title="Add a position" text="Add your stock positions to the investment manager.">
          <form @submit.prevent>
            <div class="my-2">
              <small class="fw-bold">Ticker/Symbol (eg. COF for Capital One)</small>
              <input type="text" class="form-control" required>
            </div>
            
            <div class="my-2">
              <small class="fw-bold"># Shares Purchased</small>
              <input type="number" class="form-control" required>
            </div>
            <button class="my-2 btn btn-success" type="submit">Add position</button>
          </form>
        </LuhCard>
        <LuhCard class="mb-4" title="View portfolio" text="View your current positions."></LuhCard>
      </div>
      <div>
        <LuhCard class="mb-4" title="Portfolio value vs. time" text="Visualize the change in your portfolio value over time.">
          <p v-if="positions.length === 0" class="lead text-center">Add to your portfolio for data visualization.</p>
          <Scatter v-else :data="scatterData" :options="financesBalanceVsTimeOptions" />
        </LuhCard>
      </div>
    </div>
  </div>
</template>