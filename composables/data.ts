const API_ENDPOINT = "http://localhost:8080/api/v1";

export const useUser = () => useState("useUser", () => null as IUser | null);
export const useToken = () => useState("useToken", () => null as null | string)

export const api = <T>(method: "GET" | "POST" | "DELETE") => 
  (endpoint: string, payload?: object, headers?: Record<string, string>) => 
    fetch(`${API_ENDPOINT}${endpoint}`, {
      method,
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "Authorization": `Bearer ${useToken().value}`
      },
      body: typeof payload === "object" ? JSON.stringify(payload) : undefined
    })
    .then(response => response.json() as T);

export const fetchTransactions = async () => {
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

export const fetchOrgs = async () => {
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