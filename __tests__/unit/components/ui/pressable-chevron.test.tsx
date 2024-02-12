import PressableChevron from "@/components/ui/pressable-chevron";
import { fireEvent, render, screen } from "@testing-library/react-native";

describe("PressableChevron", () => {
  const onPress = jest.fn();

  beforeEach(() => {
    render(<PressableChevron onPress={onPress} />);
  });

  it("should render the component", () => {
    expect(screen.getByRole("button")).toBeDefined();
    expect(screen.getByTestId("chevron-icon")).toBeDefined();
  });

  it("should call onPress when pressed", () => {
    fireEvent.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
