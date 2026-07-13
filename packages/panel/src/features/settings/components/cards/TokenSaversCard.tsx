import { Divider, Flex, Segmented, Switch, Typography, theme } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import type { TokenSaversConfig } from "../../domain/types.js";

const { Text } = Typography;

interface TokenSaversCardProps {
  value: TokenSaversConfig;
  onChange: (patch: Partial<TokenSaversConfig>) => void;
}

export function TokenSaversCard({ value, onChange }: TokenSaversCardProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();

  return (
    <Flex vertical gap={token.padding}>
      <ToggleRow
        title={t("settings.tokenSavers.rtkTitle")}
        description={t("settings.tokenSavers.rtkDesc")}
        checked={value.rtkEnabled}
        onChange={(v) => onChange({ rtkEnabled: v })}
      />

      <Divider style={{ margin: 0, borderColor: token.colorBorderSecondary }} />

      <ToggleRow
        title={t("settings.tokenSavers.cavemanTitle")}
        description={t("settings.tokenSavers.cavemanDesc")}
        checked={value.cavemanEnabled}
        onChange={(v) => onChange({ cavemanEnabled: v })}
      />

      <Flex vertical gap={token.paddingXS}>
        <Text strong style={{ opacity: value.cavemanEnabled ? 1 : 0.4 }}>
          {t("settings.tokenSavers.cavemanLevel")}
        </Text>
        <Segmented
          aria-label={t("settings.tokenSavers.cavemanLevel")}
          disabled={!value.cavemanEnabled}
          value={value.cavemanLevel}
          options={[
            { label: "Lite", value: "lite" },
            { label: "Full", value: "full" },
            { label: "Ultra", value: "ultra" },
          ]}
          onChange={(v) => onChange({ cavemanLevel: v as TokenSaversConfig["cavemanLevel"] })}
        />
      </Flex>
    </Flex>
  );
}

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ title, description, checked, onChange }: ToggleRowProps) {
  return (
    <Flex justify="space-between" align="center" gap={16}>
      <Flex vertical>
        <Text strong style={{ fontSize: 15 }}>
          {title}
        </Text>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {description}
        </Text>
      </Flex>
      <Switch aria-label={title} checked={checked} onChange={onChange} />
    </Flex>
  );
}
