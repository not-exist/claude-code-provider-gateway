import { ThunderboltOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Flex, Row, Skeleton, Tag, Typography, theme } from "antd";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../../../../shared/i18n/index.js";
import type { StatsResponse } from "../../domain/types.js";
import { ProviderStatCard } from "./ProviderStatCard.js";

const { Text } = Typography;

interface EnabledProvidersCardProps {
  stats: StatsResponse | null;
  isLoading?: boolean;
}

export function EnabledProvidersCard({ stats, isLoading }: EnabledProvidersCardProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const count = stats?.providers.length ?? 0;

  return (
    <Card
      style={{
        borderColor: token.colorBorderSecondary,
        boxShadow: token.boxShadow,
      }}
      styles={{
        header: {
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: `${token.padding}px ${token.paddingLG}px`,
        },
        body: { padding: token.paddingLG },
      }}
      title={
        <Flex align="center" gap={token.paddingSM}>
          <div
            style={{
              color: token.colorPrimary,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${token.colorPrimary}20 0%, ${token.colorBgContainer} 100%)`,
              border: `1px solid ${token.colorPrimary}30`,
              boxShadow: `0 0 10px ${token.colorPrimary}10`,
            }}
          >
            <ThunderboltOutlined />
          </div>
          <Text strong style={{ fontSize: 16 }}>
            {t("dashboard.enabledProviders")}
          </Text>
          {stats && (
            <Tag
              color={count > 0 ? "processing" : "default"}
              style={{ border: "none", marginLeft: token.paddingSM, fontWeight: 500 }}
            >
              {count} {t("status.enabled")}
            </Tag>
          )}
        </Flex>
      }
      extra={
        <Text type="secondary" style={{ fontSize: 13 }}>
          {t("dashboard.fromSessionHistory")} · <ThemedLink to="/history">{t("dashboard.history")}</ThemedLink>
        </Text>
      }
    >
      {isLoading ? (
        <Row gutter={[token.paddingLG, token.paddingLG]}>
          {(["sk-0", "sk-1", "sk-2"] as const).map((key) => (
            <Col xs={24} sm={12} xl={8} key={key}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Col>
          ))}
        </Row>
      ) : count === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text type="secondary">
              {t("dashboard.noEnabledProviders")} <ThemedLink to="/providers">{t("dashboard.configureProviders")}</ThemedLink>
            </Text>
          }
        />
      ) : (
        <Row gutter={[token.paddingLG, token.paddingLG]}>
          {stats?.providers.map((p) => (
            <Col xs={24} sm={12} xl={8} key={p.id}>
              <ProviderStatCard provider={p} />
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
}

function ThemedLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { token } = theme.useToken();
  return (
    <RouterLink to={to} style={{ color: token.colorPrimary, fontWeight: 500 }}>
      {children}
    </RouterLink>
  );
}
