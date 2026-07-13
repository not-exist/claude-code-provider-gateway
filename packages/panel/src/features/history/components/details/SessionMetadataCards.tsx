import { Flex, Typography, theme } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import { formatUptime } from "../../../../shared/utils/time.js";
import { formatDate } from "../../domain/format.js";
import { providerLabel } from "../../domain/labels.js";
import type { Session } from "../../domain/types.js";

const { Text } = Typography;

interface SessionMetadataCardsProps {
  session: Session;
}

export function SessionMetadataCards({ session }: SessionMetadataCardsProps) {
  const { locale, t } = useLocale();
  const { token } = theme.useToken();

  const items = [
    {
      label: t("history.started"),
      value: formatDate(session.startedAt, locale, t("history.today")),
    },
    {
      label: t("history.ended"),
      value: session.endedAt
        ? formatDate(session.endedAt, locale, t("history.today"))
        : t("history.running"),
    },
    { label: t("history.duration"), value: formatUptime(session.durationMs) },
    { label: t("history.mode"), value: session.modelMode },
    {
      label: t("liveSession.providers"),
      value:
        session.modelMode === "all"
          ? session.enabledProviders.map(providerLabel).join(", ") || t("history.none")
          : providerLabel(session.activeProvider),
    },
  ];

  return (
    <Flex
      gap={token.paddingLG * 2}
      wrap
      style={{
        padding: `${token.paddingSM}px ${token.paddingLG}px`,
        background: token.colorFillTertiary,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      {items.map(({ label, value }) => (
        <Flex vertical key={label} gap={2}>
          <Text
            type="secondary"
            style={{
              fontSize: token.fontSizeSM - 1,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Text>
          <Text strong style={{ fontSize: token.fontSizeSM + 1 }}>
            {value.length > 30 ? `${value.slice(0, 30)}…` : value}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}
