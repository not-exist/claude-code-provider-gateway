import { Descriptions, Flex, Space, Tag, Typography, theme } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import type { RequestLogEntry } from "../../domain/types.js";
import { SectionLabel } from "../tables/SectionLabel.js";

const { Text } = Typography;

interface RequestDetailsProps {
  entry: RequestLogEntry;
}

export function RequestDetails({ entry: r }: RequestDetailsProps) {
  const { locale, t } = useLocale();
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      gap={token.paddingLG}
      style={{ padding: `${token.paddingSM}px ${token.paddingLG}px` }}
    >
      <Descriptions size="small" column={2} bordered>
        <Descriptions.Item label={t("historyDetails.requestId")}>{r.id}</Descriptions.Item>
        <Descriptions.Item label={t("historyDetails.timestamp")}>
          {new Date(r.timestamp).toLocaleString(locale)}
        </Descriptions.Item>
        <Descriptions.Item label={t("historyDetails.requestedModel")}>{r.requestedModel}</Descriptions.Item>
        <Descriptions.Item label={t("common.provider")}>{r.providerId}</Descriptions.Item>
        <Descriptions.Item label={t("historyDetails.providerModel")}>{r.providerModel}</Descriptions.Item>
        <Descriptions.Item label={t("historyDetails.inputTokens")}>{r.inputTokens}</Descriptions.Item>
        <Descriptions.Item label={t("historyDetails.latencyMs")}>{r.latencyMs}</Descriptions.Item>
        <Descriptions.Item label={t("historyDetails.status")}>
          <Tag color={r.status === "ok" ? "success" : "error"} style={{ margin: 0 }}>
            {r.status}
          </Tag>
        </Descriptions.Item>
        {r.error && (
          <Descriptions.Item label={t("historyDetails.error")} span={2}>
            <Text type="danger">{r.error}</Text>
          </Descriptions.Item>
        )}
      </Descriptions>

      {r.warnings && r.warnings.length > 0 && (
        <Flex vertical gap={4}>
          <SectionLabel>Warnings</SectionLabel>
          <Space size={4} wrap>
            {r.warnings.map((warning) => (
              <Tag key={`${warning.code}-${warning.path ?? ""}`} color="warning">
                {warning.code}
              </Tag>
            ))}
          </Space>
        </Flex>
      )}
      {r.prompt && <CodeBlock label={t("historyDetails.prompt")} content={r.prompt} />}
      {r.requestPreview && (
        <CodeBlock
          label={t("historyDetails.providerRequestPreview")}
          content={JSON.stringify(r.requestPreview, null, 2)}
        />
      )}
      {r.response && <CodeBlock label={t("historyDetails.response")} content={r.response} />}
    </Flex>
  );
}

interface CodeBlockProps {
  label: string;
  content: string;
}

function CodeBlock({ label, content }: CodeBlockProps) {
  const { token } = theme.useToken();
  return (
    <Flex vertical gap={4}>
      <SectionLabel>{label}</SectionLabel>
      <Text
        style={{
          fontFamily: "monospace",
          fontSize: token.fontSizeSM,
          whiteSpace: "pre-wrap",
          background: token.colorFillSecondary,
          padding: token.paddingSM,
          borderRadius: token.borderRadiusSM,
          maxHeight: 300,
          overflow: "auto",
        }}
      >
        {content}
      </Text>
    </Flex>
  );
}
