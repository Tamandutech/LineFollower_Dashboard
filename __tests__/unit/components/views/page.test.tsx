import Page from "@/components/views/page";
import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";

describe("Page", () => {
  it("should render without errors", () => {
    render(
      <Page>
        <View testID="test">
          <Text>Teste</Text>
        </View>
      </Page>,
    );
    expect(screen.queryByTestId("test")).toBeDefined();
  });
});
