const transactions: ITransaction[] = [
  {
    name: "Spotify Premium",
    date: "11/29/2023",
    amount: -10.99,
    orgId: 1
  },
  {
    name: "User Subscription",
    date: "03/12/2024",
    amount: 58.99,
    orgId: 0
  }
];

const orgs = [
  "R&D",
  "Sales"
];

export function getTransactions() {
  return transactions;
}

export function getOrgById(id: number) {
  return orgs[id];
}