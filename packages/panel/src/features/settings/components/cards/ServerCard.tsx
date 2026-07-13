import { Alert, Form, type FormInstance, InputNumber } from "antd";
import type { CSSProperties } from "react";
import { useLocale } from "../../../../shared/i18n/index.js";
import type { ServerConfig } from "../../domain/types.js";

interface ServerCardProps {
  form: FormInstance<ServerConfig>;
  containerRuntime?: boolean;
}

const MONO_INPUT: CSSProperties = {
  width: 140,
  fontFamily: "monospace",
};

export function ServerCard({ form, containerRuntime = false }: ServerCardProps) {
  const { t } = useLocale();

  if (containerRuntime) {
    return (
      <Form form={form} layout="vertical" requiredMark={false} style={{ margin: 0 }}>
        <Form.Item name="proxyPort" label={t("settings.server.proxyPort")} style={{ marginBottom: 12 }}>
          <InputNumber style={MONO_INPUT} disabled />
        </Form.Item>
        <Alert
          type="info"
          showIcon
          message={t("settings.server.dockerNotice")}
        />
      </Form>
    );
  }

  return (
    <Form form={form} layout="vertical" requiredMark={false} style={{ margin: 0 }}>
      <Form.Item
        name="proxyPort"
        label={t("settings.server.proxyPort")}
        help="Claude Code points here via ANTHROPIC_BASE_URL"
        style={{ marginBottom: 0 }}
      >
        <InputNumber style={MONO_INPUT} min={1} max={65535} />
      </Form.Item>
    </Form>
  );
}
