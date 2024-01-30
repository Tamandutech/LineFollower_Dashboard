import ConnectBluetoothButton from "@/components/forms/connect-bluetooth-button";
import Page from "@/components/layout/page";
import { withErrorModal } from "@/hooks/use-error-modal";
import { withAuthGuard } from "@/providers/auth";
import { Redirect } from "expo-router";
import { router } from "expo-router";

const IndexScreen = withErrorModal(({ onError }) => (
  <Page alignItems="center" justifyContent="center">
    <ConnectBluetoothButton
      onConnect={() => router.push("/(app)/(root)/robot/")}
      onError={onError}
    />
  </Page>
));

export default withAuthGuard(IndexScreen, <Redirect href="/(app)/login" />);
