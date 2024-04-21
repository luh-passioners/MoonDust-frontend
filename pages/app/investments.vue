<script setup lang="ts">
import { Line, Scatter } from "vue-chartjs";

definePageMeta({
  middleware: "auth",
});

const state = useAsyncData<{
  positions: IPosition[];
  ranges: Record<string, TStockRange>;
  names: Record<string, string>;
}>("investments", async () => {
  const res = await api<{
    success: boolean;
    positions: IPosition[];
    names: Record<string, string>;
    ranges: Record<string, TStockRange>;
  }>("GET")("/positions");

  if (res.success) {
    return { positions: res.positions, ranges: res.ranges, names: res.names };
  } else {
    return { positions: [], ranges: {}, names: {} };
  }
});

const recommendations = useAsyncData("recommendations", async () => {
  const res = await api<{
    success: boolean;
    tickers: IRecommendation[];
  }>("GET")("/recommendations");

  if (res.success) {
    console.log(res);
    return res.tickers;
  } else {
    return [];
  }
});

const positions = computed(() => state.data.value?.positions || []);
const ranges = computed(() => state.data.value?.ranges || {});

const addPositionParams = reactive({
  startDate: "",
  ticker: "",
  shares: 0,
  initialPrice: 0,
});

async function addPosition() {
  const { success } = await api<{
    success: boolean;
  }>("POST")("/positions", addPositionParams);

  if (success) {
    state.refresh();
  } else {
    alert("Couldn't add that position, maybe retry?");
  }
}

const scatterData = shallowRef<any>({});

watchEffect(() => {
  const portfolioByDate: Record<number, number> = {};
  
  for (let pos of positions.value) {
    for (let point of ranges.value[pos.ticker]) {
      const { date, price } = point;

      const added = pos.shares * (date === pos.startDate ? pos.initialPrice : price);

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
          <form @submit.prevent="addPosition">
            <div class="my-2">
              <small class="fw-bold">Ticker/symbol (eg. COF for Capital One)</small>
              <input type="text" class="form-control" v-model="addPositionParams.ticker" required>
            </div>
            
            <div class="my-2">
              <small class="fw-bold"># shares purchased</small>
              <input type="number" class="form-control" v-model="addPositionParams.shares" required>
            </div>

            <div class="my-2">
              <small class="fw-bold">Purchase price</small>
              <input type="number" class="form-control" step="0.01" v-model="addPositionParams.initialPrice" required>
            </div>

            <div class="my-2">
              <small class="fw-bold">Date of purchase</small>
              <input type="date" class="form-control" required v-model="addPositionParams.startDate">
            </div>
            <button class="my-2 btn btn-success" type="submit">Add position</button>
          </form>
        </LuhCard>
        <LuhCard class="mb-4" title="View portfolio" text="View your current positions.">
          <hr>
          <p class="lead text-center" v-if="positions.length === 0">
            No positions, add one above!
          </p>
          <PositionCard 
            v-for="pos of positions" 
            :key="pos._id"
            :position="pos" 
            :current="ranges[pos.ticker][ranges[pos.ticker].length - 1].price"
            :name="state.data.value?.names[pos.ticker] || pos.ticker"   
          />
        </LuhCard>
      </div>
      <div>
        <LuhCard class="mb-4" title="Portfolio value vs. time" text="Visualize the change in your portfolio value over time.">
          <p v-if="positions.length === 0" class="lead text-center">Add to your portfolio for data visualization.</p>
          <Scatter v-else :data="scatterData" :options="financesBalanceVsTimeOptions" />
        </LuhCard>

        <LuhCard class="mb-4" title="Position recommendations" text="Our ML-powered recommendation algorithm scours the market for today's top investments.">
          <hr>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr;">
            <a href="#" @click="addPositionParams.ticker = rec.ticker;" class="btn btn-link p-0 p-1" v-for="(rec, i) of recommendations.data.value?.toSorted((a, b) => a.score - b.score)">{{ rec.ticker }}</a>
          </div>
          <p v-if="recommendations === null" class="lead text-center">Loading recommendations...</p>
        </LuhCard>
      </div>
    </div>
  </div>
</template>