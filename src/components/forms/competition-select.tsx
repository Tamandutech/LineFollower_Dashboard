import {
  type CompetitionWithRef,
  useCompetitions,
} from "@/models/competitions";
import {
  Center,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Spinner,
} from "@gluestack-ui/themed";
import { ChevronDownIcon } from "lucide-react-native";
import type { ComponentProps } from "react";

type CompetitionSelectProps = {
  onChange: (competition: CompetitionWithRef) => void;
} & ComponentProps<typeof Select>;

export default function CompetitionSelect({
  onChange,
  ...props
}: CompetitionSelectProps) {
  const { competitions } = useCompetitions();

  function handleSelect(competitionId: string) {
    const competition = competitions?.find(
      (competition) => competition.ref.id === competitionId,
    );
    if (competition) {
      onChange(competition);
    }
  }

  return (
    <Select {...props} onValueChange={handleSelect}>
      <SelectTrigger size="md" w="$48">
        <SelectInput onChangeText={handleSelect} placeholder="Competição" />
        <SelectIcon mr="$3" as={ChevronDownIcon} />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          {competitions ? (
            competitions.map((competition) => (
              <SelectItem
                key={competition.id}
                label={`${competition.name} (${competition.year})`}
                value={competition.ref.id}
              >
                {competition.name}
              </SelectItem>
            ))
          ) : (
            <Center h="$full" w="$full">
              <Spinner size="large" />
            </Center>
          )}
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}
