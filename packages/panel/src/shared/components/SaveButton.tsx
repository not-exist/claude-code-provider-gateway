import { CheckOutlined, SaveOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useLocale } from "../i18n/index.js";

interface SaveButtonProps {
  onClick: () => void;
  saving: boolean;
  saved: boolean;
  label?: string;
  savedLabel?: string;
}

export function SaveButton({
  onClick,
  saving,
  saved,
  label,
  savedLabel,
}: SaveButtonProps) {
  const { t } = useLocale();
  const resolvedLabel = label ?? t("common.save");
  const resolvedSavedLabel = savedLabel ?? t("common.saved");

  return (
    <Button
      type="primary"
      icon={saved ? <CheckOutlined /> : <SaveOutlined />}
      loading={saving}
      onClick={onClick}
    >
      {saved ? resolvedSavedLabel : resolvedLabel}
    </Button>
  );
}
