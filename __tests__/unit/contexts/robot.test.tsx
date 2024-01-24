import { RobotContext, type TRobotContext } from "@/contexts/robot";
import type { ComponentProps, ComponentType, FC } from "react";

/**
 * Cria um contexto de robô para testes.
 *
 * @param {ComponentType} Component O componente que utilizará o contexto.
 * @returns {Array} O contexto de robô e o componente que o utiliza.
 */
export function withRobotContext(
  Component: ComponentType,
): [jest.Mocked<TRobotContext>, FC] {
  const mockRobotContextValue = [null, jest.fn()] as jest.Mocked<TRobotContext>;
  return [
    mockRobotContextValue,
    function RobotContextWrapper(props: ComponentProps<typeof Component>) {
      return (
        <RobotContext.Provider value={mockRobotContextValue}>
          <Component {...props} />
        </RobotContext.Provider>
      );
    },
  ];
}

test.skip("robot", () => {});
