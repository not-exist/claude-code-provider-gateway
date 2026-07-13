import type { TableColumnsType } from "antd";
import { Tag, Tooltip, Typography, theme } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import { ProviderLogo } from "../../../providers/components/grid/ProviderLogo.js";
import { formatNumber } from "../../domain/format.js";
import { providerLabel } from "../../domain/labels.js";
import type { ModelStat } from "../../domain/types.js";

const { Text } = Typography;

export type ModelStatsRow = [string, ModelStat];

export function useModelStatsColumns(): TableColumnsType<ModelStatsRow> {
  const { t } = useLocale();
  const { token } = theme.useToken();

  return [
    {
      title: t("history.requestedModel"),
      key: "m",
      ellipsis: true,
      render: ([model]) => (
        <Text
          style={{
            fontFamily: "monospace",
            color: token.colorInfoText,
            fontSize: token.fontSizeSM,
          }}
        >
          {model}
        </Text>
      ),
    },
    {
      title: t("history.lastRoutedTo"),
      key: "r",
      ellipsis: true,
      render: ([, stat]) => <LastProviderModel stat={stat} />,
    },
    {
      title: t("history.requests"),
      key: "req",
      width: 85,
      align: "right",
      render: ([, stat]) => <CountTag color="blue" value={stat.requests} />,
    },
    {
      title: t("history.tokensIn"),
      key: "tok",
      width: 110,
      align: "right",
      render: ([, stat]) => <MutedMonoText value={formatNumber(stat.inputTokens)} />,
    },
    {
      title: t("history.avgLatency"),
      key: "lat",
      width: 100,
      align: "right",
      render: ([, stat]) => <MutedMonoText value={`${stat.avgLatencyMs}ms`} />,
    },
    {
      title: "Errors",
      key: "err",
      width: 70,
      align: "right",
      render: ([, stat]) => <ErrorCount stat={stat} />,
    },
  ];
}

function LastProviderModel({ stat }: { stat: ModelStat }) {
  const { token } = theme.useToken();

  if (!stat.lastProviderId) {
    return <Text style={{ fontFamily: "monospace", fontSize: token.fontSizeSM }}>—</Text>;
  }

  const label = providerLabel(stat.lastProviderId);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <ProviderLogo providerId={stat.lastProviderId} label={label} size={16} />
      <Text style={{ fontFamily: "monospace", fontSize: token.fontSizeSM }}>
        {label}
        {stat.lastProviderModel ? `/${stat.lastProviderModel}` : ""}
      </Text>
    </div>
  );
}

function CountTag({ color, value }: { color: string; value: number }) {
  return (
    <Tag color={color} bordered={false} style={{ margin: 0, fontFamily: "monospace" }}>
      {value}
    </Tag>
  );
}

function MutedMonoText({ value }: { value: string }) {
  return (
    <Text type="secondary" style={{ fontFamily: "monospace" }}>
      {value}
    </Text>
  );
}

function ErrorCount({ stat }: { stat: ModelStat }) {
  if (stat.errors === 0) return <MutedMonoText value="0" />;

  return (
    <Tooltip title={stat.lastError ?? ""}>
      <CountTag color="error" value={stat.errors} />
    </Tooltip>
  );
}
