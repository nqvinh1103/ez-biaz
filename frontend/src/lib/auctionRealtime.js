import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

const TOKEN_KEY = "ezbias_user";

function getToken() {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

export function createAuctionHubConnection() {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5171";
  return new HubConnectionBuilder()
    .withUrl(`${base}/hubs/auctions`, {
      accessTokenFactory: () => getToken() ?? "",
    })
    .withAutomaticReconnect([0, 1000, 3000, 5000])
    .configureLogging(LogLevel.Warning)
    .build();
}
