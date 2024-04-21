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