import { Flex, Typography } from "antd";

const { Title, Paragraph } = Typography;

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <Flex vertical gap={0}>
      <Title level={4} style={{ margin: 0 }}>
        {title}
      </Title>
      {description && (
        <Paragraph type="secondary" style={{ margin: 0 }}>
          {description}
        </Paragraph>
      )}
    </Flex>
  );
}
