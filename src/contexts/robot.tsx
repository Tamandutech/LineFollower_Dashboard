import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

export type RobotContextType = [
  Robot.BluetoothConnectionConfig | null,
  Dispatch<SetStateAction<Robot.BluetoothConnectionConfig | null>>,
];

export const RobotContext = createContext([null, () => {}] as RobotContextType);

export function useRobotContext(): RobotContextType {
  return useContext(RobotContext);
}

export function RobotContextProvider({ children }: PropsWithChildren) {
  const [robot, setRobot] = useState<Robot.BluetoothConnectionConfig | null>(
    null,
  );

  return (
    <RobotContext.Provider value={[robot, setRobot]}>
      {children}
    </RobotContext.Provider>
  );
}
