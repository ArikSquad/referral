"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const modes = [
  { value: "light", label: "Use light theme", icon: Sun },
  { value: "dark", label: "Use dark theme", icon: Moon },
  { value: "system", label: "Use system theme", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const active = theme ?? "system";

  return (
    <div
      className="flex items-center rounded-lg border bg-background p-0.5"
      suppressHydrationWarning
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = active === mode.value;

        return (
          <Tooltip key={mode.value}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="icon"
                className="size-8"
                aria-label={mode.label}
                onClick={() => setTheme(mode.value)}
              >
                <Icon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{mode.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
