import { Flex, Table, Tooltip, Typography, theme } from "antd";
import { formatNumber } from "../format.js";
import { providerLabel } from "../labels.js";
import type { ModelStat } from "../types.js";
import { SectionLabel } from "./SectionLabel.js";

const { Text } = Typography;

type Row = [string, ModelStat];

interface ModelsUsedTableProps {
  rows: Row[];
}

export function ModelsUsedTable({ rows }: ModelsUsedTableProps) {
  const { token } = theme.useToken();

  return (
    <Flex vertical gap={token.paddingXS}>
      <SectionLabel>Models used</SectionLabel>
      <Table<Row>
        dataSource={rows}
        rowKey={([m]) => m}
        size="small"
        bordered
        pagination={false}
        columns={[
          {
            title: "Requested model",
            key: "m",
            ellipsis: true,
            render: ([m]: Row) => (
              <Text
                style={{
                  fontFamily: "monospace",
                  color: token.colorInfoText,
                  fontSize: token.fontSizeSM,
                }}
              >
                {m}
              </Text>
            ),
          },
          {
            title: "Last routed to",
            key: "r",
            ellipsis: true,
            render: ([, s]: Row) => (
              <Text
                style={{
                  fontFamily: "monospace",
                  fontSize: token.fontSizeSM,
                }}
              >
                {s.lastProviderId
                  ? `${providerLabel(s.lastProviderId)}/${s.lastProviderModel ?? ""}`
                  : "—"}
              </Text>
            ),
          },
          {
            title: "Requests",
            key: "req",
            width: 85,
            align: "right",
            render: ([, s]: Row) => (
              <Text strong style={{ fontFamily: "monospace" }}>
                {s.requests}
              </Text>
            ),
          },
          {
            title: "Tokens in",
            key: "tok",
            width: 110,
            align: "right",
            render: ([, s]: Row) => (
              <Text type="secondary" style={{ fontFamily: "monospace" }}>
                {formatNumber(s.inputTokens)}
              </Text>
            ),
          },
          {
            title: "Avg latency",
            key: "lat",
            width: 100,
            align: "right",
            render: ([, s]: Row) => (
              <Text type="secondary" style={{ fontFamily: "monospace" }}>
                {s.avgLatencyMs}ms
              </Text>
            ),
          },
          {
            title: "Errors",
            key: "err",
            width: 70,
            align: "right",
            render: ([, s]: Row) =>
              s.errors > 0 ? (
                <Tooltip title={s.lastError ?? ""}>
                  <Text type="danger" style={{ fontFamily: "monospace" }}>
                    {s.errors}
                  </Text>
                </Tooltip>
              ) : (
                <Text type="secondary" style={{ fontFamily: "monospace" }}>
                  0
                </Text>
              ),
          },
        ]}
      />
    </Flex>
  );
}
