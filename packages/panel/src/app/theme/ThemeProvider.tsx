import type { ReactNode } from "react";
import { App, ConfigProvider } from "antd";
import { antdTheme } from "./antdTheme.js";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
