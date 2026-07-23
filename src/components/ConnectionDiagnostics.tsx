import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ConnStatus = "connecting" | "connected" | "disconnected" | "error";

interface Props {
  status: ConnStatus;
  rawStatus: string;
  connectedSince: number | null;
  onlineCount: number;
  peerOnline: boolean;
  events: { at: number; text: string }[];
  timeoutMs: number;
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m < 60) return `${m}m ${rs}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function ConnectionDiagnostics(props: Props) {
  const { status, rawStatus, connectedSince, onlineCount, peerOnline, events, timeoutMs } = props;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const dotColor =
    status === "connected"
      ? "bg-green-500"
      : status === "connecting"
      ? "bg-amber-500"
      : "bg-destructive";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 relative"
          aria-label="连接诊断"
        >
          <Activity className="w-4 h-4" />
          <span
            className={cn(
              "absolute top-1 right-1 w-1.5 h-1.5 rounded-full",
              dotColor,
              status !== "connected" && "animate-pulse"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3 text-xs">
        <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
          连接诊断
        </p>

        <div className="space-y-1.5 rounded-lg bg-muted/40 p-2.5">
          <Row label="订阅状态">
            <code className="text-[11px] px-1.5 py-0.5 rounded bg-background/60">
              {rawStatus}
            </code>
          </Row>
          <Row label="连接时长">
            <span className="text-foreground/80">
              {connectedSince ? formatDuration(now - connectedSince) : "—"}
            </span>
          </Row>
          <Row label="在线人数">
            <span className="text-foreground/80">{onlineCount}</span>
          </Row>
          <Row label="对方状态">
            <span
              className={cn(
                "inline-flex items-center gap-1",
                peerOnline ? "text-green-500" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  peerOnline ? "bg-green-500" : "bg-muted-foreground/60"
                )}
              />
              {peerOnline ? "在线" : "离线"}
            </span>
          </Row>
          <Row label="超时阈值">
            <span className="text-foreground/80">{Math.round(timeoutMs / 1000)}s</span>
          </Row>
        </div>

        <p className="text-[11px] font-medium text-muted-foreground mt-3 mb-1 px-1">
          最近事件
        </p>
        <div className="max-h-40 overflow-y-auto scrollbar-thin rounded-lg bg-muted/40 p-2 space-y-1">
          {events.length === 0 ? (
            <p className="text-[11px] text-muted-foreground text-center py-2">
              暂无事件
            </p>
          ) : (
            events
              .slice()
              .reverse()
              .map((e, i) => (
                <div
                  key={i}
                  className="flex items-baseline gap-2 text-[11px] leading-tight"
                >
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {new Date(e.at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className="text-foreground/85">{e.text}</span>
                </div>
              ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
