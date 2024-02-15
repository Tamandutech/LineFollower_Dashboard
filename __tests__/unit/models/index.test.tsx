import { act } from "@testing-library/react-native";

export async function waitForNextTick() {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
}

test.skip("", () => {});
