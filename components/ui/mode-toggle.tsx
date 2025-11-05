import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const isDark = theme === "dark"
  return (
      <Toggle
        pressed={isDark}
        onPressedChange={(pressed) => setTheme(pressed ? "dark" : "light")}
        aria-label="Toggle theme"
        className="relative"
      >
        {/* Sun Icon (centered and toggled via scale/rotate) */}
        <Sun
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[1.2rem] w-[1.2rem] transition-all
          ${isDark ? "scale-0 -rotate-90" : "scale-100 rotate-0"}`}
        />

        {/* Moon Icon (centered and toggled via scale/rotate) */}
        <Moon
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[1.2rem] w-[1.2rem] transition-all
          ${isDark ? "scale-100 rotate-0" : "scale-0 rotate-90"}`}
        />
    </Toggle>
  )
}
