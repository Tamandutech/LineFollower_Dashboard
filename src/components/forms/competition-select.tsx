import {
  type CompetitionWithRef,
  useCompetitions,
} from "@/models/competitions";
import { Center, SelectItem, Spinner } from "@gluestack-ui/themed";
import DenseSelect from "../ui/dense-select";
import Select from "../ui/select";

import type { ComponentProps } from "react";

type CompetitionSelectProps = {
  onChange: (competition: CompetitionWithRef) => void;
  dense?: boolean;
  selectedCompetition?: CompetitionWithRef;
} & Omit<
  ComponentProps<typeof Select>,
  "selectedValue" | "selectedLabel" | "defaultValue"
>;

export default function CompetitionSelect({
  onChange,
  selectedCompetition,
  dense = false,
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

  const content = competitions ? (
    competitions.map((competition) => (
      <SelectItem
        key={competition.id}
        label={String(competition)}
        value={competition.ref.id}
      >
        {competition.name}
      </SelectItem>
    ))
  ) : (
    <Center h="$full" w="$full">
      <Spinner size="large" />
    </Center>
  );

  return dense ? (
    <DenseSelect
      {...props}
      onValueChange={handleSelect}
      selectedValue={selectedCompetition?.ref.id}
    >
      {content}
    </DenseSelect>
  ) : (
    <Select
      {...props}
      onValueChange={handleSelect}
      size="md"
      w="$48"
      placeholder="Competição"
      selectedLabel={selectedCompetition?.toString()}
      selectedValue={selectedCompetition?.ref.id}
    >
      {content}
    </Select>
  );
}
