import { ChevronRightIcon, Icon, Pressable } from "@gluestack-ui/themed";
import type { PressableProps } from "react-native";

type PressableChevronProps = {
  onPress: PressableProps["onPress"];
};

export default function PressableChevron({ onPress }: PressableChevronProps) {
  return (
    <Pressable onPress={onPress} h="auto" w="auto" hitSlop={16} role="button">
      <Icon as={ChevronRightIcon} testID="chevron-icon" />
    </Pressable>
  );
}
