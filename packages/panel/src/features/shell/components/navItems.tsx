import {
  ApiOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ForkOutlined,
  HistoryOutlined,
  PartitionOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Badge } from "antd";

export type NavItem = NonNullable<MenuProps["items"]>[number];

const NAV_KEYS = [
  { key: "/", icon: DashboardOutlined, labelKey: "nav.dashboard" },
  { key: "/live", icon: ThunderboltOutlined, labelKey: "nav.liveSessions" },
  { key: "/providers", icon: ApiOutlined, labelKey: "nav.providers" },
  { key: "/routing", icon: ForkOutlined, labelKey: "nav.routing" },
  { key: "/model-chain", icon: PartitionOutlined, labelKey: "nav.modelChain" },
  { key: "/openai-gateway", icon: CloudServerOutlined, labelKey: "nav.openaiGateway" },
  { key: "/history", icon: HistoryOutlined, labelKey: "nav.history" },
  { key: "/logs", icon: FileTextOutlined, labelKey: "nav.serverLogs" },
  { key: "/settings", icon: SettingOutlined, labelKey: "nav.settings" },
];

export function buildNavItems(
  t: (key: string, replacements?: Record<string, string>) => string,
  isLive: boolean,
): NavItem[] {
  const items: NavItem[] = NAV_KEYS.map(({ key, icon: Icon, labelKey }) => ({
    key,
    icon: <Icon />,
    label: t(labelKey),
  }));
  return isLive ? markLiveItem(items) : items;
}

function markLiveItem(items: NavItem[]): NavItem[] {
  return items.map((item) => {
    if (item && "children" in item && Array.isArray(item.children)) {
      return { ...item, children: markLiveItem(item.children as NavItem[]) };
    }
    return item && "key" in item && item.key === "/live"
      ? {
          ...item,
          icon: (
            <Badge dot status="processing" offset={[3, -3]}>
              <ThunderboltOutlined />
            </Badge>
          ),
        }
      : item;
  });
}

export function selectedKeyFromPath(pathname: string): string {
  if (pathname === "/") return "/";
  for (const item of NAV_KEYS) {
    if (pathname === item.key || pathname.startsWith(`${item.key}/`)) return item.key;
  }
  return "/";
}
