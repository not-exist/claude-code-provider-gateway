import {
  CompressOutlined,
  GlobalOutlined,
  SafetyOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Alert, Col, Flex, Row, theme } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import { LoadingState } from "../../../../shared/components/LoadingState.js";
import { PageHeader } from "../../../../shared/components/PageHeader.js";
import { SaveButton } from "../../../../shared/components/SaveButton.js";
import { useSettings } from "../../hooks/useSettings.js";
import { ProxyCard } from "../cards/ProxyCard.js";
import { ServerCard } from "../cards/ServerCard.js";
import { SettingsCard } from "../cards/SettingsCard.js";
import { TokenSaversCard } from "../cards/TokenSaversCard.js";
import { WebToolsCard } from "../cards/WebToolsCard.js";

export default function SettingsPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const {
    serverForm,
    webTools,
    updateWebTools,
    proxy,
    updateProxy,
    tokenSavers,
    updateTokenSavers,
    runtimeMode,
    loaded,
    saving,
    saved,
    save,
  } = useSettings();

  if (!loaded) return <LoadingState />;

  const containerRuntime = runtimeMode === "container";

  return (
    <Flex vertical gap={token.paddingLG}>
      <PageHeader
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <Row gutter={[token.paddingLG, token.paddingLG]}>
        <Col xs={24} lg={12}>
          <SettingsCard title={t("settings.server")} icon={<SettingOutlined />}>
            <ServerCard form={serverForm} containerRuntime={containerRuntime} />
          </SettingsCard>
        </Col>

        <Col xs={24} lg={12}>
          <SettingsCard title={t("settings.webTools")} icon={<GlobalOutlined />}>
            <WebToolsCard value={webTools} onChange={updateWebTools} />
          </SettingsCard>
        </Col>

        <Col xs={24} lg={12}>
          <SettingsCard title={t("settings.outboundProxy")} icon={<SafetyOutlined />}>
            <ProxyCard value={proxy} onChange={updateProxy} />
          </SettingsCard>
        </Col>

        <Col xs={24} lg={12}>
          <SettingsCard title={t("settings.tokenSavers")} icon={<CompressOutlined />}>
            <TokenSaversCard value={tokenSavers} onChange={updateTokenSavers} />
          </SettingsCard>
        </Col>
      </Row>

      <Alert
        type="info"
        showIcon
        message={
          containerRuntime
            ? t("settings.containerRestartInfo")
            : t("settings.portRestartInfo")
        }
      />

      <Flex>
        <SaveButton onClick={save} saving={saving} saved={saved} label={t("common.saveSettings")} />
      </Flex>
    </Flex>
  );
}
