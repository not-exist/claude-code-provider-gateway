import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { Button, Popconfirm, Space, Tag, Typography, theme } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import { formatUptime } from "../../../../shared/utils/time.js";
import { commandFor, formatDate, topModel } from "../../domain/format.js";
import { providerLabel } from "../../domain/labels.js";
import type { Session } from "../../domain/types.js";

const { Text } = Typography;

interface SessionColumnsOptions {
  onDelete?: (id: string) => void;
  onExport?: (session: Session) => void;
  deletingId?: string | null;
  exportingId?: string | null;
}

export function useSessionColumns({
  onDelete,
  onExport,
  deletingId,
  exportingId,
}: SessionColumnsOptions): TableColumnsType<Session> {
  const { t } = useLocale();
  const { token } = theme.useToken();
  const activeDeletingId = deletingId ?? null;
  const activeExportingId = exportingId ?? null;

  const columns: TableColumnsType<Session> = [
    {
      title: t("common.status"),
      key: "status",
      width: 130,
      render: (_, session) => <SessionStatusTag status={session.status} />,
    },
    {
      title: "Command",
      key: "command",
      ellipsis: true,
      render: (_, session) => (
        <Space direction="vertical" size={4}>
          <Text style={{ fontFamily: "monospace", color: token.colorSuccessText }}>
            {commandFor(session)}
          </Text>
          <SessionMode session={session} />
        </Space>
      ),
    },
    {
      title: "Top model",
      key: "model",
      ellipsis: true,
      render: (_, session) => <TopModelText session={session} />,
    },
    {
      title: "Started",
      key: "started",
      width: 160,
      render: (_, session) => <Text type="secondary">{formatDate(session.startedAt)}</Text>,
    },
    {
      title: "Duration",
      key: "duration",
      width: 90,
      render: (_, session) => (
        <Text style={{ fontFamily: "monospace" }}>{formatUptime(session.durationMs)}</Text>
      ),
    },
    {
      title: t("history.requests"),
      dataIndex: "totalRequests",
      key: "requests",
      width: 90,
      align: "right",
      render: (value: number) => <CountTag color="blue" value={value} />,
    },
    {
      title: "Errors",
      dataIndex: "totalErrors",
      key: "errors",
      width: 75,
      align: "right",
      render: (value: number) => <ErrorCount value={value} />,
    },
  ];

  if (onDelete || onExport) {
    columns.push({
      key: "actions",
      width: 88,
      render: (_, session) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 4, paddingInlineEnd: 8 }}>
          {onExport && (
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              loading={activeExportingId === session.id}
              disabled={
                activeDeletingId === session.id ||
                (activeExportingId !== null && activeExportingId !== session.id)
              }
              aria-label={`Export session ${session.id} as JSON`}
              title={t("common.exportJson")}
              onClick={() => onExport(session)}
            />
          )}
          {onDelete && (
            <Popconfirm
              title={t("historyDetails.deleteSessionConfirm")}
              okText={t("common.delete")}
              okButtonProps={{ danger: true }}
              cancelText={t("common.cancel")}
              placement="left"
              overlayInnerStyle={{ background: "#1a1915" }}
              onConfirm={() => onDelete(session.id)}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={activeDeletingId === session.id}
                disabled={activeExportingId === session.id}
                aria-label={`Delete session ${session.id}`}
                title={t("historyDetails.deleteSession")}
              />
            </Popconfirm>
          )}
        </div>
      ),
    });
  }

  return columns;
}

export function getSessionStatusBorderColor(
  status: Session["status"],
  token: ReturnType<typeof theme.useToken>["token"],
): string {
  if (status === "running") return token.colorPrimary;
  if (status === "crashed") return token.colorError;
  return "transparent";
}

function SessionStatusTag({ status }: { status: Session["status"] }) {
  if (status === "running") {
    return (
      <Tag icon={<SyncOutlined spin />} color="blue" bordered={false}>
        RUNNING
      </Tag>
    );
  }

  if (status === "crashed") {
    return (
      <Tag icon={<CloseCircleOutlined />} color="error" bordered={false}>
        CRASHED
      </Tag>
    );
  }

  return (
    <Tag icon={<CheckCircleOutlined />} color="success" bordered={false}>
      COMPLETED
    </Tag>
  );
}

function SessionMode({ session }: { session: Session }) {
  const { token } = theme.useToken();

  return (
    <Space size="small">
      <Tag color="default" style={{ margin: 0, border: `1px solid ${token.colorBorderSecondary}` }}>
        {session.modelMode === "all"
          ? "all-providers"
          : session.modelMode === "chains"
            ? "model-chains"
            : "single"}
      </Tag>
      {session.modelMode !== "all" && session.modelMode !== "chains" && (
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {providerLabel(session.activeProvider)}
        </Text>
      )}
    </Space>
  );
}

function TopModelText({ session }: { session: Session }) {
  const { token } = theme.useToken();
  const model = topModel(session);

  if (!model) return <Text type="secondary">—</Text>;

  return (
    <Text
      style={{
        fontFamily: "monospace",
        color: token.colorInfoText,
        fontSize: token.fontSizeSM,
      }}
    >
      {model}
    </Text>
  );
}

function CountTag({ color, value }: { color: string; value: number }) {
  return (
    <Tag color={color} bordered={false} style={{ margin: 0, fontFamily: "monospace" }}>
      {value}
    </Tag>
  );
}

function ErrorCount({ value }: { value: number }) {
  if (value > 0) return <CountTag color="error" value={value} />;

  return (
    <Text type="secondary" style={{ fontFamily: "monospace" }}>
      0
    </Text>
  );
}
