import {
  Button,
  ButtonText,
  CloseIcon,
  Heading,
  Icon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
} from "@gluestack-ui/themed";
import type { ComponentProps } from "react";

export type ConfirmActionModalState = {
  /**
   * Título do modal.
   */
  header: string;

  /**
   * Descrição da ação que será realizada.
   */
  content: string;

  /**
   * Ação que será realizada ao confirmar.
   */
  onConfirm: () => void;

  /**
   * Ação que será realizada ao cancelar.
   */
  onCancel?: () => void;
};

type ConfirmActionModalProps = ConfirmActionModalState &
  ComponentProps<typeof Modal>;

export default function ConfirmActionModal({
  header,
  content,
  onConfirm,
  onCancel,
  ...props
}: ConfirmActionModalProps) {
  return (
    <Modal {...props}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{header}</Heading>
          <ModalCloseButton onPress={onCancel}>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <Text size="sm">{content}</Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" size="sm" mr="$3" onPress={onCancel}>
            <ButtonText>Cancelar</ButtonText>
          </Button>
          <Button size="sm" onPress={onConfirm}>
            <ButtonText>OK</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
