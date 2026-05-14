import type {
  RoutingConfigResponse,
  RoutingOption,
} from "../../../../daemon/src/panel/contracts.js";
import type { RoutingRule, RoutingTier } from "../../../../daemon/src/config/schema.js";

export type Tier = RoutingTier;

export type RoutingMap = Record<Tier, RoutingRule>;
export type RoutingConfig = RoutingConfigResponse;
export type { RoutingOption, RoutingRule };
