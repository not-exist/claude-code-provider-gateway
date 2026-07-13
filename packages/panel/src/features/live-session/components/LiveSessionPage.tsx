import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Collapse,
  Empty,
  Flex,
  Skeleton,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useLocale } from "../../../shared/i18n/index.js";
import { MetricSummaryGrid } from "../../../shared/components/MetricSummaryGrid.js";
import { PageHeader } from "../../../shared/components/PageHeader.js";
import { formatUptime } from "../../../shared/utils/time.js";
import { SessionMetadataCards } from "../../history/components/details/SessionMetadataCards.js";
import { ModelsUsedTable } from "../../history/components/tables/ModelsUsedTable.js";
import { ProvidersTable } from "../../history/components/tables/ProvidersTable.js";
import { RequestLogTable } from "../../history/components/tables/RequestLogTable.js";
import { commandFor } from "../../history/domain/format.js";
import type { Session } from "../../history/domain/types.js";
import { useLiveSession } from "../hooks/useLiveSession.js";

const { Text } = Typography;

export default function LiveSessionPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { sessions, isLoading, refresh, pollIntervalMs } = useLiveSession();
  const [openSessionIds, setOpenSessionIds] = useState<string[]>([]);
  const pollSeconds = Math.round(pollIntervalMs / 1000);
  const totals = useMemo(() => summarizeSessions(sessions), [sessions]);

  return (
    <Flex vertical gap={token.paddingLG}>
      <Flex justify="space-between" align="flex-start">
        <Flex vertical gap={2}>
          <Flex align="center" gap={token.paddingSM}>
            <PageHeader title={t("liveSession.title")} />
            {!isLoading &&
              (sessions.length > 0 ? (
                <Badge
                  status="processing"
                  text={
                    <Tag
                      color="blue"
                      bordered={false}
                      icon={<ThunderboltOutlined />}
                      style={{ margin: 0 }}
                    >
                      {sessions.length} {t("liveSession.running")}
                    </Tag>
                  }
                />
              ) : (
                <Tag bordered={false} style={{ margin: 0, color: token.colorTextSecondary }}>
                  {t("liveSession.idle")}
                </Tag>
              ))}
          </Flex>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("liveSession.autoRefresh")} {pollSeconds}s
          </Text>
        </Flex>
        <Button type="dashed" icon={<ReloadOutlined />} onClick={refresh}>
          {t("common.refresh")}
        </Button>
      </Flex>

      {isLoading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      ) : sessions.length === 0 ? (
        <Card>
          <Empty
            description={
              <Flex vertical align="center" gap={token.paddingXS}>
                <Text type="secondary">{t("liveSession.noActiveSessions")}</Text>
                <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  {t("liveSession.startTerminals")}
                </Text>
              </Flex>
            }
          />
        </Card>
      ) : (
        <>
          <MetricSummaryGrid
            items={[
              {
                id: "sessions",
                title: t("history.sessions"),
                value: sessions.length,
                icon: <ThunderboltOutlined />,
                color: token.colorPrimary,
                active: sessions.length > 0,
              },
              {
                id: "requests",
                title: t("history.requests"),
                value: totals.requests,
                icon: <CheckCircleOutlined />,
                color: token.colorSuccess,
                active: totals.requests > 0,
              },
              {
                id: "errors",
                title: "Errors",
                value: totals.errors,
                icon: <WarningOutlined />,
                color: token.colorError,
                active: totals.errors > 0,
              },
              {
                id: "latency",
                title: t("liveSession.avgLatencyMs"),
                value: totals.avgLatencyMs,
                icon: <ClockCircleOutlined />,
                color: token.colorWarning,
                active: totals.avgLatencyMs > 0,
              },
            ]}
          />

          <Collapse
            activeKey={openSessionIds}
            onChange={(keys) => setOpenSessionIds(Array.isArray(keys) ? keys.map(String) : [keys])}
            items={sessions.map((session) => ({
              key: session.id,
              label: <LiveSessionHeader session={session} />,
              extra: <LiveSessionSummary session={session} />,
              children: <LiveSessionDetails session={session} />,
            }))}
            style={{ background: token.colorBgContainer }}
          />
        </>
      )}
    </Flex>
  );
}

function LiveSessionHeader({ session }: { session: Session }) {
  const { token } = theme.useToken();

  return (
    <Space>
      <Badge status="processing" />
      <Text style={{ fontFamily: token.fontFamilyCode, color: token.colorSuccessText }}>
        {commandFor(session)}
      </Text>
    </Space>
  );
}

function LiveSessionSummary({ session }: { session: Session }) {
  const { token } = theme.useToken();

  return (
    <Space>
      <Tag color="blue" bordered={false}>
        {session.totalRequests} req
      </Tag>
      <Text type="secondary" style={{ fontFamily: token.fontFamilyCode }}>
        {formatUptime(session.durationMs)}
      </Text>
    </Space>
  );
}

function LiveSessionDetails({ session }: { session: Session }) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const requestLog = [...(session.requestLog ?? [])].reverse();
  const usedModels = Object.entries(session.modelStats ?? {}).sort(
    ([, a], [, b]) => b.requests - a.requests,
  );
  const providerRows = Object.entries(session.providerStats ?? {})
    .filter(([, stat]) => stat.requests > 0)
    .sort(([, a], [, b]) => b.requests - a.requests)
    .map(([id, stat]) => [id, stat] as const);

  return (
    <Flex vertical gap={token.paddingLG}>
      <SessionMetadataCards session={session} />

      {providerRows.length > 0 && (
        <ProvidersTable rows={providerRows} title={t("liveSession.sessionProviders")} />
      )}

      {usedModels.length > 0 && <ModelsUsedTable rows={usedModels} />}

      <Section title={t("liveSession.requestLog")}>
        {requestLog.length > 0 ? (
          <RequestLogTable entries={requestLog} />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text type="secondary">{t("liveSession.noRequestsYet")}</Text>}
          />
        )}
      </Section>

      <Text
        type="secondary"
        style={{ fontFamily: token.fontFamilyCode, fontSize: token.fontSizeSM - 1 }}
      >
        session id: {session.id}
      </Text>
    </Flex>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <Flex vertical gap={token.paddingXS}>
      <Text strong>{title}</Text>
      {children}
    </Flex>
  );
}

function summarizeSessions(sessions: Session[]) {
  const requests = sessions.reduce((sum, session) => sum + session.totalRequests, 0);
  const errors = sessions.reduce((sum, session) => sum + session.totalErrors, 0);
  const requestEntries = sessions.flatMap((session) => session.requestLog ?? []);
  const avgLatencyMs =
    requestEntries.length > 0
      ? Math.round(
          requestEntries.reduce((sum, request) => sum + request.latencyMs, 0) /
            requestEntries.length,
        )
      : 0;

  return {
    requests,
    errors,
    avgLatencyMs,
  };
}
