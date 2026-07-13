import { SearchOutlined } from "@ant-design/icons";
import { Flex, Input, Select, theme } from "antd";
import { useLocale } from "../../../../shared/i18n/index.js";
import {
  type ProviderStatusFilter,
  getProviderStatusOptions,
} from "../../domain/providerFilters.js";

interface ProviderToolbarProps {
  searchTerm: string;
  statusFilter: ProviderStatusFilter;
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: ProviderStatusFilter) => void;
}

export function ProviderToolbar({
  searchTerm,
  statusFilter,
  onSearchTermChange,
  onStatusFilterChange,
}: ProviderToolbarProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();

  return (
    <Flex gap={token.paddingSM} align="center" wrap>
      <Input
        placeholder={t("providers.searchPlaceholder")}
        prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        style={{ maxWidth: 300 }}
        allowClear
      />
      <Select
        value={statusFilter}
        onChange={onStatusFilterChange}
        options={getProviderStatusOptions(t)}
        style={{ width: 160 }}
      />
    </Flex>
  );
}
