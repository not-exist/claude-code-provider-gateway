import { Flex, Space, Spin, Typography, theme } from "antd";
import { useLocale } from "../i18n/index.js";

const { Text } = Typography;

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const resolvedLabel = label ?? t("common.loading");

  return (
    <Flex justify="center" style={{ padding: `${token.paddingXL}px 0` }}>
      <Space>
        <Spin />
        <Text type="secondary">{resolvedLabel}</Text>
      </Space>
    </Flex>
  );
}
