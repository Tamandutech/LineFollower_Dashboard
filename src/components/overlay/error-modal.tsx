import {
  Alert,
  AlertIcon,
  AlertText,
  Button,
  ButtonText,
  CloseIcon,
  Icon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { Heading, InfoIcon } from "lucide-react-native";

type ErrorModalProps = {
  error: Errors.IError;
  isOpen: boolean;
  onClose: () => void;
};

export default function ErrorModal({
  error,
  isOpen,
  onClose,
}: ErrorModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Erro</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <VStack>
            <Text size="sm">{error.message}</Text>
            <Alert mx="$2.5" action="muted" variant="solid">
              <AlertIcon as={InfoIcon} mr="$3" />
              <AlertText>{error.action}</AlertText>
            </Alert>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button bg="$error600" action="negative" onPress={onClose}>
            <ButtonText>Ok</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
