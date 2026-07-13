import { Divider, Flex, Input, Switch, Typography, theme } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import type { ProxyConfig } from "../../domain/types.js";

const { Text } = Typography;

interface ProxyCardProps {
  value: ProxyConfig;
  onChange: (patch: Partial<ProxyConfig>) => void;
}

export function ProxyCard({ value, onChange }: ProxyCardProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();

  return (
    <Flex vertical gap={token.padding}>
      <Flex justify="space-between" align="center" gap={16}>
        <Flex vertical>
          <Text strong style={{ fontSize: 15 }}>
            {t("settings.proxy.enable")}
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {t("settings.proxy.description")}
          </Text>
        </Flex>
        <Switch
          aria-label={t("settings.proxy.enable")}
          checked={value.enabled}
          onChange={(v) => onChange({ enabled: v })}
        />
      </Flex>

      <Divider style={{ margin: 0, borderColor: token.colorBorderSecondary }} />

      <Flex vertical gap={token.paddingXS}>
        <Text id="proxy-url-label" strong style={{ opacity: value.enabled ? 1 : 0.4 }}>
          {t("settings.proxy.url")}
        </Text>
        <Input
          aria-labelledby="proxy-url-label"
          disabled={!value.enabled}
          placeholder="http://127.0.0.1:7890"
          value={value.url}
          onChange={(e) => onChange({ url: e.target.value })}
        />
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {t("settings.proxy.restartNotice")}
        </Text>
      </Flex>
    </Flex>
  );
}
