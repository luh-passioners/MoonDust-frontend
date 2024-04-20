const transactions: ITransaction[] = [
  {
    name: "User Subscription",
    date: "2024-03-12",
    amount: 58.99,
    orgId: 0
  },
  {
    name: "Spotify Premium",
    date: "2023-11-29",
    amount: -10.99,
    orgId: 1
  },
  {
    name: "AWS Billing",
    date: "2024-04-10",
    amount: -500,
    orgId: 2
  },
  {
    name: "Salary Deposit",
    date: "2024-01-15",
    amount: 3000.00,
    orgId: 0
  },
  {
    name: "Restaurant Dinner",
    date: "2024-04-18",
    amount: -75.50,
    orgId: 2
  },
  {
    name: "Gas Station Purchase",
    date: "2024-04-20",
    amount: -30.25,
    orgId: 0
  },
  {
    name: "Netflix Subscription",
    date: "2024-05-30",
    amount: -15.99,
    orgId: 1
  },
  {
    name: "Freelance Work Payment",
    date: "2023-12-18",
    amount: 600.00,
    orgId: 2
  }
].toSorted((a, b) => a.date.localeCompare(b.date));

const orgs = [
  "R&D",
  "Sales",
  "Procurement"
];

export function getTransactions() {
  return transactions;
}

export function getOrgById(id: number) {
  return orgs[id];
}

export function getOrgsLength() {
  return orgs.length;
}

export function getOrgs() {
  return orgs;
}