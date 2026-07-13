import { BranchesOutlined, SyncOutlined, ThunderboltOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Segmented,
  Space,
  Switch,
  Typography,
  theme,
} from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import type { ChainRoutingStrategy } from "../../../../../../daemon/src/config/schema.js";
import type { RoutingOption } from "../../domain/types.js";
import { normalizeSlug } from "../../domain/utils.js";
import type { DraftChain } from "../../hooks/useChainDraft.js";
import { AddModelRow } from "../form/AddModelRow.js";
import { SortableModels } from "../sortable/SortableModels.js";

const { Text } = Typography;

interface ChainModalProps {
  open: boolean;
  draft: DraftChain | null;
  options: RoutingOption[];
  existingSlugs: string[];
  onChange: (draft: DraftChain | null) => void;
  onCancel: () => void;
  onSave: (draft: DraftChain) => void;
}

const ATTEMPTS_HINT: Record<ChainRoutingStrategy, string> = {
  waterfall: "modelChain.waterfallAttemptsHint",
  round_robin: "modelChain.roundRobinAttemptsHint",
};

const CHAIN_ORDER_HINT: Record<ChainRoutingStrategy, string> = {
  waterfall: "modelChain.waterfallOrderHint",
  round_robin: "modelChain.roundRobinOrderHint",
};

const DEFAULT_REQUEST_TIMEOUT_SECONDS = 60;
const DEFAULT_FIRST_TOKEN_TIMEOUT_SECONDS = 30;
const DEFAULT_TOTAL_STREAM_TIMEOUT_SECONDS = 60;

function secondsOrNull(value?: number): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value / 1000) : null;
}

function millisecondsOrUndefined(value: number | string | null): number | undefined {
  const numeric = typeof value === "string" ? Number(value) : value;
  return typeof numeric === "number" && Number.isFinite(numeric) && numeric > 0
    ? Math.round(numeric * 1000)
    : undefined;
}

export function ChainModal({
  open,
  draft,
  options,
  existingSlugs,
  onChange,
  onCancel,
  onSave,
}: ChainModalProps) {
  const { t } = useLocale();
  const { token } = theme.useToken();

  const canSave =
    !!draft?.name.trim() &&
    !!draft?.slug.trim() &&
    (draft?.models.length ?? 0) >= 2 &&
    !existingSlugs.includes(normalizeSlug(draft?.slug ?? ""));

  const update = (patch: Partial<DraftChain>) => {
    if (!draft) return;
    onChange({ ...draft, ...patch });
  };

  return (
    <Modal
      centered
      open={open}
      title={draft?.id.startsWith("chain_") ? t("modelChain.createChain") : t("modelChain.editChain")}
      width={720}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t("common.cancel")}
        </Button>,
        <Button
          key="save"
          type="primary"
          disabled={!draft || !canSave}
          onClick={() => draft && onSave(draft)}
        >
          {t("modelChain.saveChain")}
        </Button>,
      ]}
    >
      {draft && (
        <Flex vertical gap={token.paddingMD}>
          <Form layout="vertical">
            <Row gutter={token.paddingMD}>
              <Col flex="1">
                <Form.Item label={t("modelChain.chainName")} required style={{ marginBottom: 0 }}>
                  <Input
                    value={draft.name}
                    placeholder={t("modelChain.chainNamePlaceholder")}
                    onChange={(event) => {
                      const name = event.target.value;
                      update({
                        name,
                        slug: draft.slug ? draft.slug : normalizeSlug(name),
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col flex="1">
                <Form.Item
                  label={t("modelChain.chainSlug")}
                  required
                  style={{ marginBottom: 0 }}
                  validateStatus={
                    existingSlugs.includes(normalizeSlug(draft.slug)) ? "error" : undefined
                  }
                  help={
                    existingSlugs.includes(normalizeSlug(draft.slug))
                      ? "Slug already exists"
                      : undefined
                  }
                  tooltip={t("modelChain.slugTooltip")}
                >
                  <Input
                    prefix="--"
                    value={draft.slug}
                    placeholder="premium-rescue"
                    onChange={(event) => update({ slug: normalizeSlug(event.target.value) })}
                  />
                </Form.Item>
              </Col>
              <Col flex="none">
                <Form.Item label={t("modelChain.enabled")} style={{ marginBottom: 0 }}>
                  <Switch checked={draft.enabled} onChange={(enabled) => update({ enabled })} />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <Form layout="vertical">
            <Row gutter={token.paddingMD} align="top">
              <Col span={14}>
                <Form.Item label={t("modelChain.routingStrategy")} style={{ marginBottom: 0 }}>
                  <Segmented
                    block
                    value={draft.routingStrategy}
                    onChange={(val) => update({ routingStrategy: val as ChainRoutingStrategy })}
                    options={[
                      {
                        label: (
                          <Space>
                            <BranchesOutlined /> {t("modelChain.waterfall")}
                          </Space>
                        ),
                        value: "waterfall",
                      },
                      {
                        label: (
                          <Space>
                            <SyncOutlined /> {t("modelChain.roundRobin")}
                          </Space>
                        ),
                        value: "round_robin",
                      },
                    ]}
                  />
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                    {t(
                      draft.routingStrategy === "waterfall"
                        ? "modelChain.waterfallDescription"
                        : "modelChain.roundRobinDescription",
                    )}
                  </Text>
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                  label={t("modelChain.primaryAttempts")}
                  tooltip={t(ATTEMPTS_HINT[draft.routingStrategy])}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    min={1}
                    max={10}
                    value={draft.primaryAttempts}
                    onChange={(value) => update({ primaryAttempts: value ?? 2 })}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <Collapse
            size="small"
            ghost
            expandIconPosition="end"
            items={[
              {
                key: "advanced",
                label: (
                  <Flex vertical gap={0}>
                    <Text strong>{t("modelChain.advancedSettings")}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t("modelChain.advancedSettingsDescription")}
                    </Text>
                  </Flex>
                ),
                children: (
                  <Form layout="vertical">
                    <Row gutter={token.paddingSM}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label={t("modelChain.requestTimeout")}
                          tooltip={t("modelChain.requestTimeoutTooltip", {
                            seconds: String(DEFAULT_REQUEST_TIMEOUT_SECONDS),
                          })}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            min={1}
                            addonAfter="s"
                            placeholder={`${DEFAULT_REQUEST_TIMEOUT_SECONDS}`}
                            value={secondsOrNull(draft.requestTimeoutMs)}
                            onChange={(value) =>
                              update({ requestTimeoutMs: millisecondsOrUndefined(value) })
                            }
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label={t("modelChain.firstTokenTimeout")}
                          tooltip={t("modelChain.firstTokenTimeoutTooltip", {
                            seconds: String(DEFAULT_FIRST_TOKEN_TIMEOUT_SECONDS),
                          })}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            min={1}
                            addonAfter="s"
                            placeholder={`${DEFAULT_FIRST_TOKEN_TIMEOUT_SECONDS}`}
                            value={secondsOrNull(draft.streamIdleTimeoutMs)}
                            onChange={(value) =>
                              update({ streamIdleTimeoutMs: millisecondsOrUndefined(value) })
                            }
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label={t("modelChain.totalStreamTimeout")}
                          tooltip={t("modelChain.totalStreamTimeoutTooltip", {
                            seconds: String(DEFAULT_TOTAL_STREAM_TIMEOUT_SECONDS),
                          })}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            min={1}
                            addonAfter="s"
                            placeholder={`${DEFAULT_TOTAL_STREAM_TIMEOUT_SECONDS}`}
                            value={secondsOrNull(draft.streamTotalTimeoutMs)}
                            onChange={(value) =>
                              update({ streamTotalTimeoutMs: millisecondsOrUndefined(value) })
                            }
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                ),
              },
            ]}
          />

          <Card
            size="small"
            title={
              <Space>
                <ThunderboltOutlined />
                {t("modelChain.chainOrder")}
              </Space>
            }
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {draft.models.length < 2
                  ? t("modelChain.addAtLeastTwo")
                  : t(CHAIN_ORDER_HINT[draft.routingStrategy])}
              </Text>
            }
            styles={{ body: { padding: token.paddingSM, maxHeight: 240, overflowY: "auto" } }}
          >
            <SortableModels
              draft={draft}
              options={options}
              onChange={(models) => update({ models })}
            />
          </Card>

          <AddModelRow
            options={options}
            selectedModels={draft.models}
            onAdd={(entry) => update({ models: [...draft.models, entry] })}
          />
        </Flex>
      )}
    </Modal>
  );
}
