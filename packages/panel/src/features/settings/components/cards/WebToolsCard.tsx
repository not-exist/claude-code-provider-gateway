import { Divider, Flex, Switch, Typography, theme } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import type { WebToolsConfig } from "../../domain/types.js";

const { Text } = Typography;

interface WebToolsCardProps {
  value: WebToolsConfig;
  onChange: (patch: Partial<WebToolsConfig>) => void;
}

export function WebToolsCard({ value, onChange }: WebToolsCardProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();

  return (
    <Flex vertical gap={token.padding}>
      <ToggleRow
        labelId="web-tools-enable-search-label"
        title={t("settings.webTools.enableSearch")}
        description={t("settings.webTools.enableSearchDesc")}
        checked={value.enabled}
        onChange={(v) => onChange({ enabled: v })}
      />

      <Divider style={{ margin: 0, borderColor: token.colorBorderSecondary }} />

      <ToggleRow
        labelId="web-tools-allow-private-networks-label"
        title={t("settings.webTools.allowPrivate")}
        description={t("settings.webTools.allowPrivateDesc")}
        checked={value.allowPrivateNetworks}
        disabled={!value.enabled}
        onChange={(v) => onChange({ allowPrivateNetworks: v })}
      />
    </Flex>
  );
}

interface ToggleRowProps {
  labelId: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ labelId, title, description, checked, disabled = false, onChange }: ToggleRowProps) {

  return (
    <Flex justify="space-between" align="center" gap={16}>
      <Flex vertical>
        <Text id={labelId} strong style={{ opacity: disabled ? 0.4 : 1, fontSize: 15 }}>
          {title}
        </Text>
        <Text type="secondary" style={{ fontSize: 13, opacity: disabled ? 0.6 : 1 }}>
          {description}
        </Text>
      </Flex>
      <Switch aria-labelledby={labelId} checked={checked} disabled={disabled} onChange={onChange} />
    </Flex>
  );
}
