import { CheckCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Modal, Space, Tag, Typography, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useState } from "react";
import { useLocale } from "../../../../shared/i18n/index.js";
import type { ModelInfo, TestResult } from "../../domain/types.js";
import type { CustomProviderDraft } from "../../services/providersService.js";

const { Text } = Typography;

interface AddCustomProviderModalProps {
  open: boolean;
  testing: boolean;
  compatibility: "openai" | "anthropic";
  onCancel: () => void;
  onTest: (
    draft: CustomProviderDraft,
  ) => Promise<(TestResult & { models?: ModelInfo[] }) | TestResult>;
  onCreate: (draft: CustomProviderDraft) => Promise<string | null>;
  onCreated: (id: string) => void;
}

interface FormValues {
  name: string;
  slug: string;
  baseUrl: string;
  apiKey: string;
  logo?: UploadFile[];
}

export function AddCustomProviderModal({
  open,
  testing,
  compatibility,
  onCancel,
  onTest,
  onCreate,
  onCreated,
}: AddCustomProviderModalProps) {
  const { t } = useLocale();
  const [form] = Form.useForm<FormValues>();
  const [testResult, setTestResult] = useState<(TestResult & { models?: ModelInfo[] }) | null>(
    null,
  );
  const [creating, setCreating] = useState(false);

  const draftFromForm = async (): Promise<CustomProviderDraft> => {
    const values = await form.validateFields();
    return {
      name: values.name.trim(),
      slug: values.slug.trim(),
      baseUrl: values.baseUrl.trim(),
      apiKey: values.apiKey.trim(),
      compatibility,
      logo: values.logo?.[0]?.originFileObj ?? null,
    };
  };

  const handleTest = async () => {
    const result = await onTest(await draftFromForm());
    setTestResult(result as TestResult & { models?: ModelInfo[] });
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const id = await onCreate(await draftFromForm());
      if (id) {
        form.resetFields();
        setTestResult(null);
        onCreated(id);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      centered
      title={t("addCustomProvider.title")}
      open={open}
      onCancel={onCancel}
      width={620}
      destroyOnClose
      footer={[
        <Button key="test" loading={testing} onClick={handleTest}>
          {t("providerConfig.testConnection")}
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          {t("common.cancel")}
        </Button>,
        <Button key="create" type="primary" loading={creating} onClick={handleCreate}>
          {t("addCustomProvider.create")}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" requiredMark={false} preserve={false}>
        <Form.Item
          name="name"
          label={t("addCustomProvider.name")}
          rules={[{ required: true, message: "Provider name is required" }]}
        >
          <Input placeholder={t("addCustomProvider.namePlaceholder")} />
        </Form.Item>

        <Form.Item
          name="slug"
          label={t("addCustomProvider.slug")}
          rules={[
            { required: true, message: "Slug is required" },
            {
              pattern: /^[a-zA-Z][a-zA-Z0-9_-]{1,62}$/,
              message: "Start with a letter; use letters, numbers, _ or -",
            },
          ]}
        >
          <Input placeholder={t("addCustomProvider.slugPlaceholder")} />
        </Form.Item>

        <Form.Item
          name="baseUrl"
          label={t("addCustomProvider.baseUrl")}
          rules={[
            { required: true, message: "Base URL is required" },
            { type: "url", message: "Use a valid http:// or https:// URL" },
          ]}
        >
          <Input placeholder={t("addCustomProvider.baseUrlPlaceholder")} />
        </Form.Item>

        <Form.Item
          name="apiKey"
          label={t("addCustomProvider.apiKey")}
          rules={[{ required: true, message: "API key is required" }]}
        >
          <Input.Password placeholder={t("addCustomProvider.apiKeyPlaceholder")} autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="logo"
          label={t("addCustomProvider.logoLabel")}
          valuePropName="fileList"
          getValueFromEvent={(event) => event.fileList}
        >
          <Upload
            accept="image/png,image/webp"
            maxCount={1}
            listType="picture"
            beforeUpload={() => false}
          >
            <Button icon={<PlusOutlined />}>Upload PNG or WebP</Button>
          </Upload>
        </Form.Item>
      </Form>

      {testResult && (
        <Alert
          type={testResult.ok ? "success" : "warning"}
          showIcon
          icon={testResult.ok ? <CheckCircleOutlined /> : undefined}
          message={
            testResult.ok
              ? `${testResult.models?.length ?? testResult.modelCount ?? 0} models discovered`
              : testResult.error || "Discovery failed"
          }
          description={
            testResult.ok && testResult.models?.length ? (
              <Space wrap style={{ marginTop: 8 }}>
                {testResult.models.slice(0, 8).map((model) => (
                  <Tag key={model.id}>{model.id.replace(/^anthropic\/[^/]+\//, "")}</Tag>
                ))}
                {testResult.models.length > 8 && (
                  <Text type="secondary">+{testResult.models.length - 8} more</Text>
                )}
              </Space>
            ) : (
              "You can still add the provider and enter Manual models from its details."
            )
          }
          style={{ marginTop: 16 }}
        />
      )}
    </Modal>
  );
}
