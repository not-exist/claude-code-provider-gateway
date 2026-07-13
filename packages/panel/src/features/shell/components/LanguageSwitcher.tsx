import { GlobalOutlined } from "@ant-design/icons";
import { Dropdown, type MenuProps } from "antd";
import { useLocale } from "../../../shared/i18n/index.js";

const localeLabels: Record<string, string> = {
  en: "🇬🇧 EN",
  "zh-CN": "🇨🇳 中文",
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const items: MenuProps["items"] = [
    { key: "en", label: "🇬🇧 English" },
    { key: "zh-CN", label: "🇨🇳 中文" },
  ];

  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "en" || key === "zh-CN") setLocale(key);
  };

  return (
    <Dropdown menu={{ items, onClick, selectedKeys: [locale] }} trigger={["click"]}>
      <span
        style={{
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
          userSelect: "none",
        }}
      >
        <GlobalOutlined style={{ marginRight: 4 }} />
        {localeLabels[locale]}
      </span>
    </Dropdown>
  );
}
