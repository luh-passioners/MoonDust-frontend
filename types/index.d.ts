declare interface ITransaction {
  _id: string;
  name: string;
  company: string;
  org_id: string;
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

declare interface IPosition {
  _id: string;
  ticker: string;
  shares: number;
  startDate: string;
  initialPrice: number;
  
  active: boolean; // below props exist iff active = true
  endDate?: string;
  netChange?: number;
}

declare type TStockRange = ({ date: string, price: number })[];