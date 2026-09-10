/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { ConnectionInfo } from "@/lib/types";
import { createElement, useCallback, useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { CalendarDays, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  connectCalendar,
  fetchCalendarConnection,
  refreshCalendarConnection,
} from "@/lib/connections";

const styles = {
  root: "space-y-1.5",
  title: "px-0.5 text-sm font-semibold text-sidebar-foreground",
  error: "text-xs text-destructive",
  skeleton: "h-11 w-full rounded-xl",
  row: "flex items-center gap-2 rounded-xl bg-sidebar-accent/50 px-2 py-2",
  iconBox: "flex size-8 shrink-0 items-center justify-center rounded-lg",
  iconBoxConnected: "bg-primary text-primary-foreground",
  iconBoxDisconnected: "bg-card text-muted-foreground ring-1 ring-border",
  icon: "size-4",
  meta: "min-w-0 flex-1",
  label: "truncate text-sm font-semibold leading-tight",
  status: "mt-0.5 text-xs font-medium",
  statusConnected: "text-primary",
  statusDisconnected: "text-muted-foreground",
  actionBtn: "h-8 shrink-0 px-2.5",
  refreshBtn: "shrink-0",
  refreshIcon: "size-3.5",
} as const;

function statusLabel(status: ConnectionInfo["status"]) {
  if (status === "connected") return "Connected";
  if (status === "pending") return "Pending";

  return "Not Connected";
}

function ConnectionsPanel({ sessionToken }: { sessionToken: string }) {
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const handleLoadCalendarConnection = useCallback(async () => {
    setLoading(true);

    try {
      setConnection(await fetchCalendarConnection(sessionToken));
    } catch {
      console.log("failed to load calendar connection");
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    handleLoadCalendarConnection();
  }, [handleLoadCalendarConnection]);

  async function handleCalendarConnect() {
    setBusy(true);
    try {
      await connectCalendar(sessionToken);
    } catch {
      console.log("failed to connect");
    }
  }

  async function handleCalendarRefresh() {
    setBusy(true);

    try {
      await refreshCalendarConnection(sessionToken);
      await handleLoadCalendarConnection();
    } catch {
      console.log("failed to refresh");
    } finally {
      setBusy(false);
    }
  }

  const connected = connection?.status === "connected";

  return createElement(
    "div",
    { className: styles.root },
    createElement("p", { className: styles.title }, "Connections"),
    loading || !connection
      ? createElement(Skeleton, { className: styles.skeleton })
      : createElement(
          "div",
          { className: styles.row },
          createElement(
            "div",
            {
              className: cn(
                styles.iconBox,
                connected ? styles.iconBoxConnected : styles.iconBoxDisconnected,
              ),
            },
            createElement(CalendarDays, { className: styles.icon }),
          ),
          createElement(
            "div",
            { className: styles.meta },
            createElement("p", { className: styles.label }, connection.label),
            createElement(
              "p",
              {
                className: cn(
                  styles.status,
                  connected ? styles.statusConnected : styles.statusDisconnected,
                ),
              },
              statusLabel(connection.status),
            ),
          ),
          createElement(
            Button,
            {
              size: "sm",
              variant: connected ? "ghost" : "default",
              className: styles.actionBtn,
              disabled: busy,
              onClick: handleCalendarConnect,
            },
            connected ? "Reconnect" : "Connect",
          ),
          createElement(
            Button,
            {
              size: "icon-sm",
              variant: "ghost",
              className: styles.refreshBtn,
              disabled: busy,
              onClick: handleCalendarRefresh,
            },
            createElement(RefreshCcw, { className: styles.refreshIcon }),
          ),
        ),
  );
}

export default ConnectionsPanel;
