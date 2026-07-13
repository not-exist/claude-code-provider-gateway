import { CheckCircleOutlined, DatabaseOutlined, WarningOutlined } from "@ant-design/icons";
import { theme } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import { MetricSummaryGrid } from "../../../../shared/components/MetricSummaryGrid.js";

interface HistorySummaryProps {
  archived: number;
  totalRequests: number;
  totalErrors: number;
}

export function HistorySummary({ archived, totalRequests, totalErrors }: HistorySummaryProps) {
  const { t } = useLocale();
  const { token } = theme.useToken();

  const metrics = [
    {
      id: "archived",
      title: t("history.archivedSessions"),
      value: archived,
      icon: <DatabaseOutlined />,
      color: token.colorTextSecondary,
      active: archived > 0,
    },
    {
      id: "total-requests",
      title: t("history.totalRequests"),
      value: totalRequests,
      icon: <CheckCircleOutlined />,
      color: token.colorSuccess,
      active: totalRequests > 0,
    },
    {
      id: "total-errors",
      title: "Total Errors",
      value: totalErrors,
      icon: <WarningOutlined />,
      color: token.colorError,
      active: totalErrors > 0,
    },
  ];

  return <MetricSummaryGrid items={metrics} />;
}
