import { Button, Modal, Typography } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import type { ConfirmAction, ProviderInfo } from "../../domain/types.js";

const { Text } = Typography;

interface ConfirmModalProps {
  action: ConfirmAction | null;
  providers: ProviderInfo[];
  onCancel: () => void;
  onConfirm: () => void;
}

const CONFIRM_COPY = {
  "replace-key": {
    title: "confirmModal.replaceKeyTitle",
    text: "confirmModal.replaceKeyText",
    okText: "confirmModal.replace",
    danger: false,
  },
  "remove-key": {
    title: "confirmModal.removeKeyTitle",
    text: "confirmModal.removeKeyText",
    okText: "common.remove",
    danger: true,
  },
  "change-url": {
    title: "confirmModal.changeBaseUrlTitle",
    text: "confirmModal.changeBaseUrlText",
    okText: "confirmModal.update",
    danger: false,
  },
  "delete-provider": {
    title: "confirmModal.deleteProviderTitle",
    text: "confirmModal.deleteProviderText",
    okText: "common.delete",
    danger: true,
  },
} as const;

export function ConfirmModal({ action, providers, onCancel, onConfirm }: ConfirmModalProps) {
  const { t } = useLocale();

  if (!action) return null;
  const label = providers.find((p) => p.id === action.providerId)?.label ?? action.providerId;
  const copy = CONFIRM_COPY[action.kind];

  return (
    <Modal
      centered
      open
      title={t(copy.title)}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t("confirmModal.cancel")}
        </Button>,
        <Button key="ok" type="primary" danger={copy.danger} onClick={onConfirm} autoFocus>
          {t(copy.okText)}
        </Button>,
      ]}
      width={420}
    >
      <Text type="secondary">{t(copy.text, { provider: label })}</Text>
    </Modal>
  );
}
