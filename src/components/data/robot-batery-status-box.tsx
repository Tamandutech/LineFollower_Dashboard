import { levelToStyleMap } from "@/constants/styles";
import {
  batteryVoltageFormatter,
  useRobotBatteryStatus,
} from "@/models/battery";
import { HStack, Icon, Spinner, Text } from "@gluestack-ui/themed";

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
