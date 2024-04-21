import { Chart, LinearScale, PointElement, LineElement, Legend, type Point, CategoryScale, BarElement, Tooltip } from "chart.js";

Chart.defaults.font.family = "Inter";
Chart.register(LinearScale, PointElement, LineElement, CategoryScale, BarElement, Tooltip, Legend);

export const financesBalanceVsTimeOptions: any = {
  plugins: {
    tooltip: {
      callbacks: {
        label(context: any) {
          const fmt = (s: number) => (s % 1000).toLocaleString("en-US", { minimumIntegerDigits: 2 });

          const d = new Date(context.parsed.x);
          let month = d.getMonth() + 1;
          let day = d.getDate() + 1;

          const xParsed = `${fmt(month)}/${fmt(day)}/${fmt(d.getFullYear())}`;
          const yParsed = (context.parsed.y < 0 ? "-" : "") + "$" + Math.abs(context.parsed.y)
            .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          return `${yParsed} on ${xParsed}`;
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        callback(value: number) {
          const fmt = (s: number) => (s % 1000).toLocaleString("en-US", { minimumIntegerDigits: 2 });

          const d = new Date(value);
          let month = d.getMonth() + 1;

          return `${fmt(month)}/${fmt(d.getDate())}/${fmt(d.getFullYear())}`;
        }
      }
    },
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

export const useFinancesBalanceVsTimeData = (cumulative: Point[]) => ({
  datasets: [{
    label: "Balance vs. time",
    data: cumulative,
    backgroundColor: "blue",
    showLine: true,
  }],
});

export const useFinancesByOrganizationData = (incoming: number[], outgoing: number[]) => ({
  labels: incoming.map((t, i) => (i)),
  datasets: [{
    label: "Incoming",
    data: incoming,
    backgroundColor: "green",
  },
  {
    label: "Outgoing",
    data: outgoing,
    backgroundColor: "red",
  }],
});

export const financesByOrganizationOptions: any = {
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

export const useInvestmentsPortfolioOverTimeData: any = (portfolioVsTime: TStockRange) => ({
  datasets: [{
    label: "Balance vs. time",
    data: portfolioVsTime,
    backgroundColor: "blue",
    showLine: true,
  }],
});