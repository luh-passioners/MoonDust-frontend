declare interface ITransaction {
  _id: string;
  name: string;
  company: string;
  orgId: number;
  date: string;
  amount: number;
}

declare interface IUser {
  _id: string;
  username: string;
  name: string;
  company: string;
  type: "full" | "org";
  org_id?: string;
}

declare interface IOrg {
  _id: string;
  company: string;
  name: string;
}