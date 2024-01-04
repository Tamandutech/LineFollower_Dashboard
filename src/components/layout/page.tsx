import { Box } from "@gluestack-ui/themed";
import type { ComponentProps } from "react";

type PageProps = ComponentProps<typeof Box>;

export default function Page({ children, ...props }: PageProps) {
  return (
    <Box {...props} h="$full" w="$full" p="$4">
      {children}
    </Box>
  );
}
