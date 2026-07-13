import { ExportOutlined } from "@ant-design/icons";
import { Button, Modal, Switch } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import { openExternal } from "../../../../shared/openExternal.js";
import { getApiKeyLink } from "../../domain/apiKeyLinks.js";
import { canTestProvider } from "../../domain/status.js";
import type { CopilotFlow, ProviderInfo } from "../../domain/types.js";
import { ProviderLogo } from "../grid/ProviderLogo.js";
import { ProviderConfigContent, type ProviderConfigHandlers } from "./ProviderConfigContent.js";

export interface ProviderConfigModalHandlers extends ProviderConfigHandlers {
  onTest: (id: string) => void;
  onRequestDeleteProvider: (id: string) => void;
}

export interface ProviderConfigModalProps {
  provider: ProviderInfo | null;
  open: boolean;
  onClose: () => void;
  testing: boolean;
  oauthBusyFor: string | null;
  oauthError: string | null;
  copilotFlow: CopilotFlow | null;
  handlers: ProviderConfigModalHandlers;
  onToggleEnabled: (id: string, currentlyEnabled: boolean) => void;
}

export function ProviderConfigModal({
  provider: p,
  open,
  onClose,
  testing,
  oauthBusyFor,
  oauthError,
  copilotFlow,
  handlers,
  onToggleEnabled,
}: ProviderConfigModalProps) {
  const { t } = useLocale();

  if (!p) return null;

  return (
    <Modal
      centered
      title={<ProviderConfigTitle provider={p} onToggleEnabled={onToggleEnabled} t={t} />}
      open={open}
      onCancel={onClose}
      footer={[
        p.custom && (
          <Button key="delete" danger onClick={() => handlers.onRequestDeleteProvider(p.id)}>
            {t("common.delete")}
          </Button>
        ),
        <Button
          key="test"
          loading={testing}
          disabled={!canTestProvider(p)}
          onClick={() => handlers.onTest(p.id)}
        >
          {t("providerConfig.testConnection")}
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          {t("common.close")}
        </Button>,
      ]}
      width={600}
      destroyOnClose
    >
      <ProviderConfigContent
        provider={p}
        oauthBusyFor={oauthBusyFor}
        oauthError={oauthError}
        copilotFlow={copilotFlow}
        handlers={handlers}
      />
    </Modal>
  );
}

function ProviderConfigTitle({
  provider,
  onToggleEnabled,
  t,
}: {
  provider: ProviderInfo;
  onToggleEnabled: (id: string, currentlyEnabled: boolean) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}) {
  const apiKeyUrl = getApiKeyLink(provider.id);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingRight: 32,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ProviderLogo
          providerId={provider.id}
          label={provider.label}
          logoUrl={provider.logoUrl}
          size={28}
        />
        <span style={{ fontSize: 18 }}>
          {provider.label} {t("providerConfig.configuration")}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {apiKeyUrl && (
          <Button size="small" icon={<ExportOutlined />} onClick={() => openExternal(apiKeyUrl)}>
            {t("providerConfig.getApiKey")}
          </Button>
        )}
        <Switch
          size="small"
          checked={provider.enabled}
          onChange={() => onToggleEnabled(provider.id, provider.enabled)}
          aria-label={`${t(provider.enabled ? "common.disable" : "common.enable")} ${provider.label}`}
        />
      </div>
    </div>
  );
}
