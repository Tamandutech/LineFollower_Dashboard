import ConnectBluetoothButton from "@/components/forms/connect-bluetooth-button";
import Page from "@/components/layout/page";
import { withErrorModal } from "@/hooks/use-error-modal";
import { router } from "expo-router";

export default withErrorModal(function IndexScreen({ onError }) {
  return (
    <Page alignItems="center" justifyContent="center">
      <ConnectBluetoothButton
        onConnect={() => router.push("/(app)/(root)/robot/")}
        onError={onError}
      />
    </Page>
  );
});
