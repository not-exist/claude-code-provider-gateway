import { Flex, Space, Spin, Typography, theme } from "antd";

const { Text } = Typography;

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  const { token } = theme.useToken();
  return (
    <Flex justify="center" style={{ padding: `${token.paddingXL}px 0` }}>
      <Space>
        <Spin />
        <Text type="secondary">{label}</Text>
      </Space>
    </Flex>
  );
}
