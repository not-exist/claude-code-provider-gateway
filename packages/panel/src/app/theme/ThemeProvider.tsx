import { App, ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import type { ReactNode } from "react";
import { useLocale } from "../../shared/i18n/index.js";
import { antdTheme } from "./antdTheme.js";

const antdLocales = { en: enUS, "zh-CN": zhCN };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  return (
    <ConfigProvider theme={antdTheme} locale={antdLocales[locale]}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
