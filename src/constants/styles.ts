import { BatteryLevel } from "@/models/battery";
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryWarning,
} from "lucide-react-native";
import type { FC } from "react";

export const levelToStyleMap = new Map<
  BatteryLevel,
  { color: string; icon: FC; label: string }
>([
  [
    BatteryLevel.CRITIC,
    { color: "$error500", icon: BatteryWarning, label: "Crítico" },
  ],
  [
    BatteryLevel.LOW,
    { color: "$warning500", icon: BatteryLow, label: "Baixo" },
  ],
  [BatteryLevel.OK, { color: "$success500", icon: BatteryFull, label: "OK" }],
  [
    BatteryLevel.UNKNOWN,
    { color: "$tertiary500", icon: BatteryCharging, label: "Desconhecido" },
  ],
]);
