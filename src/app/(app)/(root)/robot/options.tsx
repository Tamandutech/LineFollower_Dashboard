import Page from "@/components/layout/page";
import DenseSelect from "@/components/ui/dense-select";
import {
  batteryLowWarningThresholdOptions,
  batteryStatusUpdateIntervalOptions,
} from "@/constants/options";
import { useRobotContext } from "@/contexts/robot";
import { useRobotBatteryStatus } from "@/models/battery";
import { useSettings } from "@/models/sessions";
import { withAuthGuard } from "@/providers/auth";
import {
  Divider,
  HStack,
  Heading,
  Icon,
  SelectItem,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { Redirect } from "expo-router";
import {
  BatteryCharging,
  BatteryWarning,
  Bot,
  Code2,
  Settings,
  Timer,
} from "lucide-react-native";
import {
  type ComponentProps,
  type ComponentType,
  type PropsWithChildren,
  useMemo,
} from "react";

function OptionsScreen() {
  return (
    <Page>
      <VStack space="lg" flex={1}>
        <RobotSection />
        <Divider />
        <BatteryMonitoringSection />
      </VStack>
    </Page>
  );
}

function RobotSection() {
  const [robot] = useRobotContext();
  const { status } = useRobotBatteryStatus();
  return (
    <Section title="Robô">
      <Option label="Nome" icon={Bot}>
        <OptionText>{robot?.name}</OptionText>
      </Option>
      <Option label="Bateria" icon={BatteryCharging}>
        <OptionText>
          {status ? `${status.voltage}mV` : "Indisponível"}
        </OptionText>
      </Option>
      <Option label="Interface" icon={Code2}>
        <OptionText>{robot?.interface}</OptionText>
      </Option>
    </Section>
  );
}

function BatteryMonitoringSection() {
  const { settings, update } = useSettings();
  const selectedBatteryStatusIntervalOption = useMemo(
    () =>
      batteryStatusUpdateIntervalOptions.find(
        (option) => option.value === settings.batteryStatusUpdateInterval,
      ),
    [settings.batteryStatusUpdateInterval],
  );
  const selectedBatteryLowWarningThresholdOption = useMemo(
    () =>
      batteryLowWarningThresholdOptions.find(
        (option) => option.value === settings.batteryLowWarningThreshold,
      ),
    [settings.batteryLowWarningThreshold],
  );
  return (
    <Section title="Monitoramento de Bateria">
      <Option
        label="Atualizar tensão da bateria"
        help={selectedBatteryStatusIntervalOption?.label}
        icon={Timer}
      >
        <DenseSelect
          onValueChange={(value) =>
            update({ batteryStatusUpdateInterval: Number(value) })
          }
          selectedLabel={selectedBatteryStatusIntervalOption?.label}
          selectedValue={String(selectedBatteryStatusIntervalOption?.value)}
        >
          {batteryStatusUpdateIntervalOptions.map(({ value, label }) => (
            <SelectItem key={label} value={String(value)} label={label} />
          ))}
        </DenseSelect>
      </Option>
      <Option
        label="Alerta sobre a tensão da bateria"
        help={selectedBatteryLowWarningThresholdOption?.label}
        icon={BatteryWarning}
      >
        <DenseSelect
          onValueChange={(value) =>
            update({ batteryLowWarningThreshold: Number(value) })
          }
          selectedLabel={selectedBatteryLowWarningThresholdOption?.label}
          selectedValue={String(
            selectedBatteryLowWarningThresholdOption?.value,
          )}
        >
          {batteryLowWarningThresholdOptions.map(({ value, label }) => (
            <SelectItem key={label} value={String(value)} label={label} />
          ))}
        </DenseSelect>
      </Option>
    </Section>
  );
}

type SectionProps = PropsWithChildren<{ title: string }>;

function Section({ title, children }: SectionProps) {
  return (
    <VStack space="lg">
      <Heading size="md" mb="$1">
        {title}
      </Heading>
      {children}
    </VStack>
  );
}

type OptionProps = PropsWithChildren<{
  label: string;
  help?: string;
  icon?: ComponentType<IconProps>;
}> &
  ComponentProps<typeof HStack>;

function Option({ label, icon = Settings, help, children }: OptionProps) {
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <HStack space="md" alignItems="center">
        <Icon as={icon} />
        {help ? (
          <VStack justifyContent="space-around">
            <Text>{label}</Text>
            <Text sub>{help}</Text>
          </VStack>
        ) : (
          <Text>{label}</Text>
        )}
      </HStack>
      {children}
    </HStack>
  );
}

function OptionText({ children, ...props }: ComponentProps<typeof Text>) {
  return (
    <Text {...props} sub>
      {children}
    </Text>
  );
}

export default withAuthGuard(OptionsScreen, <Redirect href="/(app)/login" />);
