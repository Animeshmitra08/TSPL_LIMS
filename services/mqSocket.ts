import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

const RECONNECT_DELAY_MS = 3000;
const WS_PORT = process.env.EXPO_PUBLIC_MQ_WS_PORT || "8080";

// Address of the server/ receiver service. RabbitMQ's real host/port/
// credentials live in server/.env and are used by that receiver, not here —
// this only needs to reach the WebSocket bridge.
//
// The hostUri fallback below only works in Expo dev (Metro serving the app
// on the same LAN the device used to load it) — there is no hostUri in a
// standalone/production build, so every device would fall back to
// "localhost" and never connect. Once server/ is deployed somewhere every
// device can reach, set EXPO_PUBLIC_MQ_WS_URL in .env to that address
// (e.g. wss://mq.yourdomain.com) so it's used instead, in every build.
function resolveWsUrl(): string {
  const override = process.env.EXPO_PUBLIC_MQ_WS_URL;
  if (override) return override;

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  const host = hostUri?.split(":")[0];
  return `ws://${host || "localhost"}:${WS_PORT}`;
}

// Matches MQ_BRIDGE_TOKEN on the server/ side (server/wsServer.js) — only
// needed once the bridge requires it (empty there means no check at all).
const WS_TOKEN = process.env.EXPO_PUBLIC_MQ_WS_TOKEN;

function buildConnectUrl(): string {
  const base = resolveWsUrl();
  if (!WS_TOKEN) return base;
  return `${base}${base.includes("?") ? "&" : "?"}token=${encodeURIComponent(WS_TOKEN)}`;
}

const WS_URL = buildConnectUrl();
console.log(`[mq] resolved WebSocket URL: ${WS_URL}`);

export type MqMessage = {
  timestamp: string;
  // Payload shape is whatever the producer publishes — kept as a generic
  // JSON record so new/changed fields show up without any app changes.
  data: Record<string, unknown>;
};

type ConnectionStatus = "connecting" | "open" | "closed";

export function useMqSocket() {
  const [messages, setMessages] = useState<MqMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    // Detaches the old socket's own handlers before closing it, so its
    // onclose doesn't ALSO schedule a redundant reconnect on top of the
    // immediate one connect() (called right after) already starts.
    function teardown(socket: WebSocket | null) {
      if (!socket) return;
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    }

    function connect() {
      console.log(`🔌 [mq] Attempting to connect to ${WS_URL} ...`);
      setStatus("connecting");
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log(`✅ [mq] WebSocket CONNECTED to ${WS_URL}`);
        setStatus("open");
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type !== "message") {
            console.log("[mq] received non-message frame, ignoring:", parsed.type);
            return;
          }
          console.log("📩 [mq] DATA RECEIVED:", JSON.stringify(parsed.data));
          const message: MqMessage = { timestamp: parsed.timestamp, data: parsed.data };
          setMessages((prev) => [message, ...prev].slice(0, 100));
        } catch (err) {
          console.warn("[mq] failed to parse frame:", event.data, err);
        }
      };

      socket.onerror = (event) => {
        console.warn(`❌ [mq] FAILED to connect to ${WS_URL}:`, event);
        socket.close();
      };

      socket.onclose = (event) => {
        console.warn(`⚠️ [mq] Connection CLOSED (code ${event.code}${event.reason ? `, reason: ${event.reason}` : ""}) — retrying in ${RECONNECT_DELAY_MS}ms`);
        setStatus("closed");
        if (!cancelled) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    }

    connect();

    // Android/iOS can silently kill a backgrounded app's socket without ever
    // firing onclose (the OS just drops the underlying connection) — the
    // hook would then sit there believing it's still "open" while no data
    // is actually arriving, which is exactly "reopen the app from Recent
    // Apps and the live feed is frozen". Rather than wait on a close event
    // that may never come, force a fresh connection immediately every time
    // the app comes back to the foreground.
    const appStateSubscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        clearTimeout(reconnectTimer);
        teardown(socketRef.current);
        connect();
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      appStateSubscription.remove();
      teardown(socketRef.current);
    };
  }, []);

  return { messages, status };
}
