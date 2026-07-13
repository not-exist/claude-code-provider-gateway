import { Button, Modal, Typography } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";

const { Text } = Typography;

interface ClearHistoryModalProps {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ClearHistoryModal({ open, loading, onCancel, onConfirm }: ClearHistoryModalProps) {
  const { t } = useLocale();

  return (
    <Modal
      centered
      open={open}
      title={t("history.clearArchivedHistory")}
      onCancel={() => !loading && onCancel()}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          {t("common.cancel")}
        </Button>,
        <Button key="ok" type="primary" danger loading={loading} onClick={onConfirm} autoFocus>
          {t("history.clear")}
        </Button>,
      ]}
      width={440}
    >
      <Text type="secondary">
        {t("history.clearHistoryConfirm")}
      </Text>
    </Modal>
  );
}
