import {
  ApiOutlined,
  CheckOutlined,
  CodeOutlined,
  CopyOutlined,
  KeyOutlined,
  LinkOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  ConfigProvider,
  Flex,
  Input,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  theme,
} from "antd";
import { useState } from "react";
import { useLocale } from "../../../shared/i18n/index.js";
import { LoadingState } from "../../../shared/components/LoadingState.js";
import { PageHeader } from "../../../shared/components/PageHeader.js";
import { useCopyToClipboard } from "../../../shared/hooks/useCopyToClipboard.js";
import type { OpenAIGatewayModels } from "../domain/types.js";
import { useOpenAIGateway } from "../hooks/useOpenAIGateway.js";

const { Text, Paragraph } = Typography;
type OpenAIGatewayModel = OpenAIGatewayModels["models"][number];

export default function OpenAIGatewayPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { data, status, cursorFields, reload, models } = useOpenAIGateway();
  const { copiedKey, copy } = useCopyToClipboard();
  const [modelQuery, setModelQuery] = useState("");

  if (status === "loading" && !data) return <LoadingState />;

  const modelList = models.data?.models ?? [];
  const providers = Array.from(new Set(modelList.map((model) => model.ownedBy))).sort();
  const normalizedModelQuery = modelQuery.trim().toLowerCase();

  const filteredModels = normalizedModelQuery
    ? modelList.filter(
        (model) =>
          model.id.toLowerCase().includes(normalizedModelQuery) ||
          model.ownedBy.toLowerCase().includes(normalizedModelQuery),
      )
    : modelList;

  const tableColumns: TableProps<OpenAIGatewayModel>["columns"] = [
    {
      title: t("openaiGateway.modelId"),
      dataIndex: "id",
      key: "id",
      render: (text: string) => (
        <Flex justify="space-between" align="center">
          <Text
            ellipsis={{ tooltip: text }}
            style={{ maxWidth: 250, fontFamily: "Geist Mono, monospace" }}
          >
            {text}
          </Text>
          <Button
            type="text"
            size="small"
            icon={
              copiedKey === `model-${text}` ? (
                <CheckOutlined style={{ color: token.colorSuccess }} />
              ) : (
                <CopyOutlined />
              )
            }
            onClick={() => copy(`model-${text}`, text)}
            aria-label={t("openaiGateway.copyModel", { model: text })}
            title={t("openaiGateway.copyModel", { model: text })}
          />
        </Flex>
      ),
    },
    {
      title: t("openaiGateway.provider"),
      dataIndex: "ownedBy",
      key: "ownedBy",
      width: 120,
      render: (text: string) => <Tag style={{ margin: 0 }}>{text}</Tag>,
      filters: providers.map((p) => ({ text: p, value: p })),
      onFilter: (value, record) => record.ownedBy === value,
    },
  ];

  const exampleItems =
    data?.examples.map((example) => ({
      key: example.key,
      label: (
        <Space>
          <CodeOutlined />
          {t(
            example.key === "models"
              ? "openaiGateway.listModelsExample"
              : example.key === "chat"
                ? "openaiGateway.chatCompletionExample"
                : example.key === "stream"
                  ? "openaiGateway.streamingChatExample"
                  : example.title,
          )}
        </Space>
      ),
      children: (
        <div style={{ position: "relative" }}>
          <Button
            size="small"
            style={{ position: "absolute", top: 8, right: 8 }}
            icon={
              copiedKey === `example-${example.key}` ? (
                <CheckOutlined style={{ color: token.colorSuccess }} />
              ) : (
                <CopyOutlined />
              )
            }
            onClick={() => copy(`example-${example.key}`, example.command)}
          >
            {t("common.copy")}
          </Button>
          <pre
            style={{
              margin: 0,
              padding: token.padding,
              paddingRight: 80,
              overflowX: "auto",
              borderRadius: token.borderRadius,
              background: token.colorBgLayout,
              fontFamily: "Geist Mono, monospace",
              fontSize: token.fontSizeSM,
            }}
          >
            {example.command}
          </pre>
        </div>
      ),
    })) || [];

  const getCursorFieldLabel = (key: string, fallback: string) => {
    switch (key) {
      case "baseUrl":
        return t("openaiGateway.apiBase");
      case "apiKey":
        return t("openaiGateway.apiKey");
      case "modelsUrl":
        return t("openaiGateway.modelsEndpoint");
      case "chatCompletionsUrl":
        return t("openaiGateway.chatCompletionsEndpoint");
      default:
        return fallback;
    }
  };

  return (
    <Flex vertical gap={token.paddingLG}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={token.padding}>
        <PageHeader
          title={t("openaiGateway.title")}
          description={t("openaiGateway.description")}
        />
        {models.status === "success" && (
          <Badge count={modelList.length} color="blue" showZero overflowCount={999}>
            <Card size="small" styles={{ body: { padding: "8px 16px" } }}>
              <Space>
                <ApiOutlined style={{ color: token.colorPrimary }} />
                <Text strong>{t("openaiGateway.availableModels")}</Text>
              </Space>
            </Card>
          </Badge>
        )}
        {models.status === "error" && (
          <Badge status="error" text="">
            <Card size="small" styles={{ body: { padding: "8px 16px" } }}>
              <Space>
                <ApiOutlined style={{ color: token.colorError }} />
                <Text strong type="danger">
                  Models Unavailable
                </Text>
                <Button size="small" onClick={models.reload}>
                  Retry
                </Button>
              </Space>
            </Card>
          </Badge>
        )}
      </Flex>

      {status === "error" && (
        <Alert
          type="error"
          showIcon
          message="Unable to load gateway details"
          action={<Button onClick={reload}>Retry</Button>}
        />
      )}

      {data && (
        <Flex vertical gap={token.paddingLG}>
          {/* Top Row: Connection Details & Model Explorer */}
          <Row gutter={[token.paddingLG, token.paddingLG]} align="stretch">
            <Col xs={24} lg={10} xl={8}>
              <Card
                title={
                  <Space>
                    <ApiOutlined />
                    {t("openaiGateway.connectionDetails")}
                  </Space>
                }
                style={{ height: "100%" }}
                styles={{ body: { padding: token.padding } }}
              >
                <Flex vertical gap={token.marginMD}>
                  {cursorFields.map((field) => (
                    <Flex key={field.key} vertical gap={4}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {getCursorFieldLabel(field.key, field.label)}
                      </Text>
                      <Input
                        readOnly
                        value={field.value}
                        prefix={field.key === "apiKey" ? <KeyOutlined /> : <LinkOutlined />}
                        suffix={
                          <Button
                            type="text"
                            size="small"
                            icon={
                              copiedKey === field.key ? (
                                <CheckOutlined style={{ color: token.colorSuccess }} />
                              ) : (
                                <CopyOutlined />
                              )
                            }
                            onClick={() => copy(field.key, field.value)}
                            aria-label={t("openaiGateway.copyField", {
                              field: getCursorFieldLabel(field.key, field.label),
                            })}
                          />
                        }
                        style={{ fontFamily: "Geist Mono, monospace" }}
                      />
                    </Flex>
                  ))}
                </Flex>
              </Card>
            </Col>

            <Col xs={24} lg={14} xl={16}>
              <Card
                title={
                  <Space>
                    <ApiOutlined />
                    {t("openaiGateway.modelExplorer")}
                  </Space>
                }
                extra={
                  <Space wrap>
                    <Input
                      placeholder={t("openaiGateway.modelsSearchPlaceholder")}
                      prefix={<SearchOutlined />}
                      value={modelQuery}
                      onChange={(e) => setModelQuery(e.target.value)}
                      allowClear
                      style={{ width: 220 }}
                    />
                    <Button
                      icon={<ReloadOutlined />}
                      loading={models.status === "loading"}
                      onClick={models.reload}
                      type="text"
                      aria-label={t("openaiGateway.refreshModels")}
                      title={t("openaiGateway.refreshModels")}
                    />
                  </Space>
                }
                style={{ height: "100%" }}
                styles={{ body: { padding: 0 } }}
              >
                {models.status === "error" ? (
                  <Alert
                    type="error"
                    showIcon
                    message={t("openaiGateway.failedToLoadModels")}
                    description={
                      models.error instanceof Error ? models.error.message : "Unknown error"
                    }
                    action={
                      <Button size="small" onClick={models.reload}>
                        Retry
                      </Button>
                    }
                    style={{ margin: token.padding }}
                  />
                ) : (
                  <ConfigProvider theme={{ components: { Table: { headerBorderRadius: 0 } } }}>
                    <Table
                      dataSource={filteredModels}
                      columns={tableColumns}
                      rowKey="id"
                      size="small"
                      pagination={{
                        pageSize: 6,
                        showSizeChanger: false,
                        position: ["bottomRight"],
                        style: { margin: "12px 16px" },
                      }}
                      scroll={{ y: 260 }}
                    />
                  </ConfigProvider>
                )}
              </Card>
            </Col>
          </Row>

          {/* Bottom Row: Client Setup & Integration Examples */}
          <Row gutter={[token.paddingLG, token.paddingLG]} align="stretch">
            <Col xs={24} lg={10} xl={8}>
              <Card
                title={
                  <Space>
                    <CodeOutlined />
                    {t("openaiGateway.clientSetup")}
                  </Space>
                }
                style={{ height: "100%" }}
              >
                <Flex vertical gap={token.marginMD}>
                  <Flex gap={token.marginXS} wrap="wrap">
                    <Tag color="green">/v1/models</Tag>
                    <Tag color="blue">/v1/chat/completions</Tag>
                    <Tag color="purple">streaming</Tag>
                    <Tag color="cyan">tools</Tag>
                  </Flex>
                  <div>
                    <Text strong>{t("openaiGateway.compatibleClients")}</Text>
                    <Paragraph
                      type="secondary"
                      style={{ marginBottom: 0, fontSize: token.fontSizeSM }}
                    >
                      {t("openaiGateway.compatibleClientsDescription")}
                    </Paragraph>
                  </div>
                  <div>
                    <Text strong>{t("openaiGateway.modelSelection")}</Text>
                    <Paragraph
                      type="secondary"
                      style={{ marginBottom: 0, fontSize: token.fontSizeSM }}
                    >
                      {t("openaiGateway.modelSelectionDescriptionBefore")} {""}
                      <Text code>{data.exampleModel}</Text>{" "}
                      {t("openaiGateway.modelSelectionDescriptionAfter")}
                    </Paragraph>
                  </div>
                </Flex>
              </Card>
            </Col>

            <Col xs={24} lg={14} xl={16}>
              <Card
                title={
                  <Space>
                    <ThunderboltOutlined />
                    {t("openaiGateway.integrationExamples")}
                  </Space>
                }
                style={{ height: "100%" }}
                styles={{ body: { paddingTop: 0 } }}
              >
                <Tabs items={exampleItems} />
              </Card>
            </Col>
          </Row>
        </Flex>
      )}
    </Flex>
  );
}
