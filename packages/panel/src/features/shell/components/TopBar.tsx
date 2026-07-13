import { PoweroffOutlined } from "@ant-design/icons";
import { App, Badge, Button, Flex, Layout, Popconfirm, Tooltip, Typography, theme } from "antd";
import { useLocale } from "../../../shared/i18n/index.js";
import { STATE_BADGE, useGatewayControl } from "../hooks/useGatewayControl.js";
import { LanguageSwitcher } from "./LanguageSwitcher.js";

const { Header } = Layout;
const { Text } = Typography;

export function TopBar() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const control = useGatewayControl({ message });
  const { t } = useLocale();

  return (
    <Header
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        padding: `0 ${token.paddingLG}px`,
        height: 56,
        lineHeight: "56px",
      }}
    >
      <Flex justify="space-between" align="center" style={{ height: "100%" }}>
        <Flex align="center" gap={token.paddingSM}>
          <Badge status={STATE_BADGE[control.state]} />
          <Text strong>{t(`topbar.${control.state}`)}</Text>
        </Flex>
        <Flex align="center" gap={token.padding}>
          <LanguageSwitcher />
          <ControlButton
            isRunning={control.isRunning}
            busy={control.busy}
            canStart={control.canStartFromPanel}
            onStop={control.stop}
            onStart={control.start}
          />
        </Flex>
      </Flex>
    </Header>
  );
}

function ControlButton({
  isRunning,
  busy,
  canStart,
  onStop,
  onStart,
}: {
  isRunning: boolean;
  busy: boolean;
  canStart: boolean;
  onStop: () => void;
  onStart: () => void;
}) {
  const { t } = useLocale();

  if (isRunning) {
    return (
      <Popconfirm
        title={t("topbar.stopGateway")}
        description={t("topbar.stopGatewayDesc")}
        okText={t("topbar.stop")}
        cancelText={t("topbar.cancel")}
        okButtonProps={{ danger: true }}
        onConfirm={onStop}
      >
        <Button danger icon={<PoweroffOutlined />} loading={busy}>
          {t("topbar.stop")}
        </Button>
      </Popconfirm>
    );
  }

  if (!canStart) {
    return (
      <Tooltip title={t("topbar.devOnlyTooltip")}>
        <Button icon={<PoweroffOutlined />} disabled>
          {t("topbar.start")}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button type="primary" icon={<PoweroffOutlined />} loading={busy} onClick={onStart}>
      {t("topbar.start")}
    </Button>
  );
}
