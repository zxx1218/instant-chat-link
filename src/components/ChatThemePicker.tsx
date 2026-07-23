import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CHAT_THEMES } from "@/lib/chatThemes";
import { cn } from "@/lib/utils";

interface ChatThemePickerProps {
  themeId: string;
  onChange: (id: string) => void;
}

export function ChatThemePicker({ themeId, onChange }: ChatThemePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          aria-label="切换主题配色"
        >
          <Palette className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
          聊天室配色
        </p>
        <div className="grid grid-cols-3 gap-2">
          {CHAT_THEMES.map((t) => {
            const active = t.id === themeId;
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={cn(
                  "group relative rounded-xl p-2 border transition-all",
                  active
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-border/60 hover:border-border"
                )}
                aria-label={`选择主题 ${t.name}`}
              >
                <div
                  className="h-10 rounded-lg mb-1.5"
                  style={{
                    background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]}, ${t.swatch[2]})`,
                  }}
                />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-foreground/80 truncate">
                    {t.name}
                  </span>
                  {active && (
                    <Check className="w-3 h-3 text-primary shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
