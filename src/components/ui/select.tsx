import {
  ChevronDownIcon,
  Select as SelectWrapper,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectPortal,
  SelectTrigger,
} from "@gluestack-ui/themed";

import type { ComponentProps } from "react";

type SelectProps = {
  w?: ComponentProps<typeof SelectTrigger>["w"];
  size?: ComponentProps<typeof SelectTrigger>["size"];
  placeholder?: ComponentProps<typeof SelectInput>["placeholder"];
  dense?: boolean;
} & Omit<ComponentProps<typeof SelectWrapper>, "width" | "w">;

export default function Select({
  w,
  size,
  placeholder,
  children,
  ...props
}: SelectProps) {
  return (
    <SelectWrapper {...props}>
      <SelectTrigger size={size} w={w}>
        <SelectInput placeholder={placeholder} />
        <SelectIcon mr="$3" as={ChevronDownIcon} />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          {children}
        </SelectContent>
      </SelectPortal>
    </SelectWrapper>
  );
}
