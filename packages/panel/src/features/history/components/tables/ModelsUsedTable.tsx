import { Flex, Table, theme } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import { type ModelStatsRow, useModelStatsColumns } from "./modelStatsColumns.js";
import { SectionLabel } from "./SectionLabel.js";

interface ModelsUsedTableProps {
  rows: ModelStatsRow[];
}

export function ModelsUsedTable({ rows }: ModelsUsedTableProps) {
  const { t } = useLocale();
  const { token } = theme.useToken();
  const columns = useModelStatsColumns();

  return (
    <Flex vertical gap={token.paddingXS}>
      <SectionLabel>{t("historyDetails.modelsUsed")}</SectionLabel>
      <Table<ModelStatsRow>
        dataSource={rows}
        rowKey={([m]) => m}
        size="small"
        pagination={false}
        columns={columns}
      />
    </Flex>
  );
}
