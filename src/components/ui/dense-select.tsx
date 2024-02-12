import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectPortal,
  SelectTrigger,
} from "@gluestack-ui/themed";
import { type ComponentProps, type PropsWithChildren, useState } from "react";
import PressableChevron from "./pressable-chevron";

type DenseSelectProps = PropsWithChildren<{
  onValueChange: ComponentProps<typeof Select>["onValueChange"];
  selectedValue?: ComponentProps<typeof Select>["selectedValue"];
  selectedLabel?: ComponentProps<typeof Select>["selectedLabel"];
  defaultValue?: ComponentProps<typeof Select>["defaultValue"];
}>;

export default function DenseSelect({
  onValueChange,
  selectedLabel,
  selectedValue,
  defaultValue,
  children,
}: DenseSelectProps) {
  const [show, setShow] = useState(false);

  function toggleShow() {
    setShow((prev) => !prev);
  }

  return (
    <>
      <PressableChevron onPress={toggleShow} />
      <Select
        onClose={toggleShow}
        display="none"
        selectedLabel={selectedLabel}
        selectedValue={selectedValue}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
      >
        <SelectTrigger>
          <SelectInput />
        </SelectTrigger>
        <SelectPortal isOpen={show} onClose={toggleShow}>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {children}
          </SelectContent>
        </SelectPortal>
      </Select>
    </>
  );
}
