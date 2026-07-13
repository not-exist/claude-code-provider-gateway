import { Flex, Table } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import { useProviderStatsColumns, type ProviderStatsRow } from "./providerStatsColumns.js";
import { SectionLabel } from "./SectionLabel.js";

interface ProvidersTableProps {
  rows: ProviderStatsRow[];
  title?: string;
}

export function ProvidersTable({ rows, title }: ProvidersTableProps) {
  const { t } = useLocale();
  const columns = useProviderStatsColumns();

  return (
    <Flex vertical gap={4}>
      <SectionLabel>{title ?? t("providers.title")}</SectionLabel>
      <Table<ProviderStatsRow>
        dataSource={rows}
        rowKey={([id]) => id}
        size="small"
        pagination={false}
        columns={columns}
      />
    </Flex>
  );
}
