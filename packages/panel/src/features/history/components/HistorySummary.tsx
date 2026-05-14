import { Card, Col, Row, Statistic, theme } from "antd";

interface HistorySummaryProps {
  sessionCount: number;
  archived: number;
  totalRequests: number;
  totalErrors: number;
}

export function HistorySummary({
  sessionCount,
  archived,
  totalRequests,
  totalErrors,
}: HistorySummaryProps) {
  const { token } = theme.useToken();

  return (
    <Row gutter={[token.padding, token.padding]}>
      <Col span={6}>
        <Card>
          <Statistic title="Sessions" value={sessionCount} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Archived" value={archived} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Total Requests" value={totalRequests} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Total Errors"
            value={totalErrors}
            valueStyle={{
              color: totalErrors > 0 ? token.colorError : undefined,
            }}
          />
        </Card>
      </Col>
    </Row>
  );
}
