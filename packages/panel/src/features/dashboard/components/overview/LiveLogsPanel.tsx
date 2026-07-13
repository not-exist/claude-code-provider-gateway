import { ClearOutlined, PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Flex, Space, Typography, theme } from "antd";
import { useEffect, useRef } from "react";
import { useLocale } from "../../../../shared/i18n/index.js";

const { Text } = Typography;

interface LiveLogsPanelProps {
  logs: string[];
  paused: boolean;
  onTogglePaused: () => void;
  onClear: () => void;
}

export function LiveLogsPanel({ logs, paused, onTogglePaused, onClear }: LiveLogsPanelProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paused && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  });

  return (
    <Card
      title={
        <Space>
          <Badge status={paused ? "warning" : "processing"} />
          <span>{t("dashboard.liveLogs")}</span>
          <Text type="secondary" style={{ fontWeight: token.fontWeightStrong }}>
            {t("dashboard.logLines", { count: String(logs.length) })}
          </Text>
        </Space>
      }
      extra={
        <Space>
          <Button
            icon={paused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
            onClick={onTogglePaused}
            danger={paused}
            type={paused ? "primary" : "default"}
          >
            {paused ? t("dashboard.resume") : t("dashboard.pause")}
          </Button>
          <Button icon={<ClearOutlined />} onClick={onClear}>
            {t("common.clear")}
          </Button>
        </Space>
      }
      styles={{ body: { padding: 0 } }}
    >
      <Flex
        ref={containerRef}
        vertical
        style={{
          height: 400,
          overflowY: "auto",
          padding: token.paddingSM,
          background: token.colorFillQuaternary,
          borderBottomLeftRadius: token.borderRadiusLG,
          borderBottomRightRadius: token.borderRadiusLG,
          fontFamily: token.fontFamilyCode,
          fontSize: token.fontSizeSM,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {logs.length === 0 ? (
          <Text type="secondary" style={{ opacity: 0.4 }}>
            {t("dashboard.waitingForLogActivity")}
          </Text>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: log lines are append-only and can repeat exactly.
          logs.map((line, i) => <LogLine key={i} line={line} />)
        )}
      </Flex>
    </Card>
  );
}

function LogLine({ line }: { line: string }) {
  const type = / \[ERROR\] /.test(line)
    ? "danger"
    : / \[WARN\] /.test(line)
      ? "warning"
      : "secondary";
  return <Text type={type}>{line}</Text>;
}
