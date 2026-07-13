import { Flex, theme } from "antd";
import { useLocale } from "../../../shared/i18n/index.js";
import { PageHeader } from "../../../shared/components/PageHeader.js";
import { useDashboardPage } from "../hooks/useDashboardPage.js";
import { EnabledProvidersCard } from "./overview/EnabledProvidersCard.js";
import { StatusOverview } from "./overview/StatusOverview.js";
import { QuickLaunchCard } from "./quick-launch/QuickLaunchCard.js";
import { ShellSetupCard } from "./shell-setup/ShellSetupCard.js";

export default function DashboardPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const page = useDashboardPage();
  const isContainerRuntime = page.shellSetup?.runtime.mode === "container";

  const shellSetupCard = page.shouldShowShellSetup
    ? page.shellSetup && (
        <ShellSetupCard
          setup={page.shellSetup}
          panelPort={page.status?.panelPort ?? 6767}
          defaultOpen={!page.hasTerminalConfigured}
          canDismiss={page.hasTerminalConfigured}
          onRefresh={page.refreshShellSetup}
          onDismiss={page.dismissShellSetup}
        />
      )
    : null;

  return (
    <Flex vertical gap={token.paddingLG}>
      <PageHeader title={t("dashboard.title")} />
      <StatusOverview status={page.status} topModel={page.topModel} isLoading={page.isLoading} />
      <EnabledProvidersCard stats={page.stats} isLoading={page.isLoading} />
      <QuickLaunchCard items={page.launchItems} error={page.launchError} />
      {!isContainerRuntime && !page.hasTerminalConfigured && shellSetupCard}
      {(isContainerRuntime || page.hasTerminalConfigured) && shellSetupCard}
    </Flex>
  );
}
