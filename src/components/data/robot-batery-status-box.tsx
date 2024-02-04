import { BatteryLevel, useRobotBatteryStatus } from "@/models/battery";
import { HStack, Icon, Spinner, Text } from "@gluestack-ui/themed";
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryWarning,
} from "lucide-react-native";
import type { FC } from "react";

const batteryVoltageFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const levelToStyleMap = new Map<BatteryLevel, { color: string; icon: FC }>([
  [BatteryLevel.CRITIC, { color: "$error500", icon: BatteryWarning }],
  [BatteryLevel.LOW, { color: "$warning500", icon: BatteryLow }],
  [BatteryLevel.OK, { color: "$success500", icon: BatteryFull }],
  [BatteryLevel.UNKNOWN, { color: "$tertiary500", icon: BatteryCharging }],
]);

export default function RobotBatteryStatusBox() {
  const { status, isLoading, level } = useRobotBatteryStatus();
  return (
    <HStack alignItems="center" space="xs">
      <Icon
        key={level}
        as={levelToStyleMap.get(level)?.icon}
        color={levelToStyleMap.get(level)?.color}
        size="xl"
        testID={`battery-${level.toLocaleLowerCase()}-icon`}
      />
      {!status && isLoading ? (
        <Spinner color="$tertiary500" testID="loading-spinner" />
      ) : (
        <Text size="sm">{`${batteryVoltageFormatter.format(
          (status?.voltage || 0) / 1000,
        )}V`}</Text>
      )}
    </HStack>
  );
}
