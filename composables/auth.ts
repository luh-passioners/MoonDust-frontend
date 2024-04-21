export const useIsLoggedIn = () => useState("useIsLoggedIn", () => false);
export const useUser = () => useState("useUser", () => null as IUser | null);
export const useToken = () => useState("useToken", () => null as null | string);