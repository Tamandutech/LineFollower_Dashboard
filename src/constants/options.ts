import type { ColorModeOption } from "@/contexts/color-mode";
import { batteryVoltageFormatter } from "@/models/battery";
import { defaultSettings } from "@/models/sessions";
import { ONE_MINUTE_IN_MILLISECONDS } from ".";

export type Option = {
  value: number;
  label: string;
};

export const batteryStatusUpdateIntervalOptions: Array<Option> = Array.from(
  new Set([
    0,
    30000,
    60000,
    90000,
    120000,
    defaultSettings.batteryStatusUpdateInterval,
  ]),
).map((interval) => ({
  value: interval,
  label: `${interval / ONE_MINUTE_IN_MILLISECONDS} ${
    interval > ONE_MINUTE_IN_MILLISECONDS ? "minutos" : "minuto"
  }`,
}));

export const batteryLowWarningThresholdOptions: Array<Option> = Array.from(
  new Set([
    7900,
    7600,
    7400,
    7200,
    6900,
    6600,
    defaultSettings.batteryLowWarningThreshold,
  ]),
).map((threshold) => ({
  label: `${batteryVoltageFormatter.format(threshold / 1000)}V`,
  value: threshold,
}));

export const colorModeOptions: { label: string; value: ColorModeOption }[] = [
  { label: "Claro", value: "light" },
  { label: "Escuro", value: "dark" },
  { label: "Automático", value: "automatic" },
];
