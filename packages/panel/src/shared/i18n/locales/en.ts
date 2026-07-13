const en = {
  // ── Navigation ──
  "nav.dashboard": "Dashboard",
  "nav.liveSessions": "Live Sessions",
  "nav.providers": "Providers",
  "nav.routing": "Routing",
  "nav.modelChain": "Model Chain",
  "nav.openaiGateway": "OpenAI Gateway",
  "nav.history": "History",
  "nav.serverLogs": "Server Logs",
  "nav.settings": "Settings",
  "nav.starOnGitHub": "Star us on GitHub",

  // ── TopBar / Gateway Control ──
  "topbar.stopGateway": "Stop gateway?",
  "topbar.stopGatewayDesc":
    "The proxy will be unavailable until the gateway starts again.",
  "topbar.stop": "Stop",
  "topbar.start": "Start",
  "topbar.cancel": "Cancel",
  "topbar.running": "Gateway running",
  "topbar.offline": "Gateway stopped",
  "topbar.unknown": "Checking…",
  "topbar.devOnlyTooltip":
    "In development, restart it with `bun dev:desk`",

  // ── Common / Shared ──
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.test": "Test",
  "common.create": "Create",
  "common.add": "Add",
  "common.remove": "Remove",
  "common.enabled": "Enabled",
  "common.disabled": "Disabled",
  "common.enable": "Enable",
  "common.disable": "Disable",
  "common.loading": "Loading…",
  "common.loadingModels": "Loading models…",
  "common.noModelsFound": "No models found",
  "common.noData": "No data",
  "common.export": "Export",
  "common.exportJson": "Export as JSON",
  "common.copy": "Copy",
  "common.copied": "Copied!",
  "common.refresh": "Refresh",
  "common.search": "Search",
  "common.filter": "Filter",
  "common.all": "All",
  "common.favorites": "Favorites",
  "common.confirm": "Confirm",
  "common.ok": "OK",
  "common.error": "Error",
  "common.success": "Success",
  "common.retry": "Retry",
  "common.provider": "Provider",
  "common.model": "Model",
  "common.models": "Models",
  "common.slug": "Slug",
  "common.name": "Name",
  "common.apiKey": "API Key",
  "common.baseUrl": "Base URL",
  "common.url": "URL",
  "common.port": "Port",
  "common.seconds": "sec",
  "common.ms": "ms",
  "common.status": "Status",
  "common.saveSettings": "Save Settings",
  "common.saveRouting": "Save routing",
  "common.saving": "Saving…",
  "common.saved": "Saved",
  "common.actions": "Actions",

  // ── Dashboard ──
  "dashboard.title": "Dashboard",
  "dashboard.description": "Gateway overview and quick actions.",
  "dashboard.statusOverview": "Status Overview",
  "dashboard.quickLaunch": "Quick Launch",
  "dashboard.shellSetup": "Shell Setup",
  "dashboard.liveLogs": "Live Logs",
  "dashboard.enabledProviders": "Enabled Providers",
  "dashboard.fromSessionHistory": "From session history",
  "dashboard.history": "History",
  "dashboard.noEnabledProviders": "No enabled providers.",
  "dashboard.configureProviders": "Configure providers",
  "dashboard.providerRequests": "requests",
  "dashboard.providerErrors": "errors",
  "dashboard.none": "None",

  // ── Shell Setup ──
  "shell.installActions": "Install Actions",
  "shell.manualCommand": "Manual Command",
  "shell.copyCommand": "Copy command",
  "shell.commandCopied": "Command copied!",
  "shell.autoInstall": "Auto Install",

  // ── Providers ──
  "providers.title": "Providers",
  "providers.description":
    "Select a provider card below to configure API keys, custom URLs, and active models.",
  "providers.searchPlaceholder": "Search providers…",
  "providers.allProviders": "All Providers",
  "providers.favorites": "Favorites",
  "providers.noProvidersFound": "No providers found matching your filters",
  "providers.noFavoritesYet":
    "No favorite providers yet. Star some providers from the All Providers tab!",
  "providers.noFavoritesFilter":
    "No favorite providers found matching your filters",
  "providers.favoritesTipDismissed":
    "Tip: You can drag and drop cards to reorganize your favorites.",
  "providers.addAnthropicCompatible": "Add Anthropic Compatible",
  "providers.addOpenAICompatible": "Add OpenAI Compatible",
  "providers.providerConfig": "Provider Configuration",
  "providers.localProviders": "Local Providers",
  "providers.oauthProviders": "OAuth Providers",
  "providers.apiKeyProviders": "API Key Providers",
  "providers.customProviders": "Custom Providers",

  // ── Provider Config ──
  "providerConfig.apiKeySection": "API Key",
  "providerConfig.apiKeyPlaceholder": "Paste your provider API key here",
  "providerConfig.baseUrlSection": "Base URL",
  "providerConfig.baseUrlPlaceholder": "http://localhost:...",
  "providerConfig.baseUrlWarning":
    "Provider credentials are sent to this endpoint. Use only URLs you trust.",
  "providerConfig.modelsSection": "Models",
  "providerConfig.modelsSearchPlaceholder": "Search models…",
  "providerConfig.extraModelsSection": "Extra Models",
  "providerConfig.extraModelsPlaceholder": "provider/model-id",
  "providerConfig.filterPlaceholder": "Filter…",
  "providerConfig.runtimeLimits": "Runtime Limits",
  "providerConfig.maxConcurrent": "Max concurrent",
  "providerConfig.maxConcurrentDesc": "Caps simultaneous in-flight requests.",
  "providerConfig.requestsLabel": "Requests",
  "providerConfig.requestsDesc": "Caps request starts inside the window.",
  "providerConfig.windowLabel": "Window",
  "providerConfig.windowDesc": "Window size in seconds.",
  "providerConfig.oauthSection": "OAuth",
  "providerConfig.oauthLogin": "Log in with {provider}",
  "providerConfig.oauthLoggedIn": "Logged in as {account}",
  "providerConfig.oauthRefresh": "Refresh token",
  "providerConfig.oauthLogout": "Log out",
  "providerConfig.testConnection": "Test Connection",
  "providerConfig.testing": "Testing…",
  "providerConfig.save": "Save",

  // ── Add Custom Provider ──
  "addCustomProvider.title": "Add Custom Provider",
  "addCustomProvider.name": "Name",
  "addCustomProvider.namePlaceholder": "Acme AI",
  "addCustomProvider.slug": "Slug",
  "addCustomProvider.slugPlaceholder": "acme_ai",
  "addCustomProvider.baseUrl": "Base URL",
  "addCustomProvider.baseUrlPlaceholder": "https://api.example.com/v1",
  "addCustomProvider.apiKey": "API Key",
  "addCustomProvider.apiKeyPlaceholder": "sk-...",
  "addCustomProvider.logoLabel": "Logo",
  "addCustomProvider.create": "Create",
  "addCustomProvider.testAndCreate": "Test & Create",

  // ── Confirm Modal ──
  "confirmModal.enableTitle": "Enable {provider}?",
  "confirmModal.enableMessage":
    "This will activate the provider for routing and model selection.",
  "confirmModal.disableTitle": "Disable {provider}?",
  "confirmModal.disableMessage":
    "The provider will be unavailable for routing and model selection.",
  "confirmModal.enable": "Enable",
  "confirmModal.disable": "Disable",
  "confirmModal.cancel": "Cancel",

  // ── Routing ──
  "routing.title": "Routing",
  "routing.description":
    "Override which provider and model handles each Claude tier. When disabled, requests pass through unchanged.",
  "routing.noProvidersEnabled": "No providers enabled",
  "routing.noProvidersEnabledDesc":
    "Enable and configure a provider on the Providers page before setting up routing.",
  "routing.default": "Default",
  "routing.opus": "Opus",
  "routing.sonnet": "Sonnet",
  "routing.haiku": "Haiku",
  "routing.selectProvider": "Select provider",
  "routing.modelNotInList":
    "This model is not in the provider's enabled list",
  "routing.thinking": "Thinking",
  "routing.thinkingDesc": "Extended reasoning for supported models",
  "routing.thinkingEnabled": "Enable thinking (extended reasoning)",

  // ── Model Chain ──
  "modelChain.title": "Model Chain",
  "modelChain.description":
    "Create custom Claude-discoverable models that try providers in your priority order.",
  "modelChain.alertMessage":
    "Model chains appear in Claude as Custom Models",
  "modelChain.alertDesc":
    "Use the model picker entry, or launch directly with ccpg --yourSlug. The first model is tried first; failures move to the next entry.",
  "modelChain.noChains": "No chains yet",
  "modelChain.addChain": "Add Chain",
  "modelChain.createChain": "Create Chain",
  "modelChain.editChain": "Edit Chain",
  "modelChain.chainName": "Name",
  "modelChain.chainNamePlaceholder": "Premium Rescue",
  "modelChain.chainSlug": "Slug",
  "modelChain.chainSlugPlaceholder": "premium-rescue",
  "modelChain.enabled": "Enabled",
  "modelChain.routingStrategy": "Routing strategy",
  "modelChain.waterfall": "Waterfall",
  "modelChain.roundRobin": "Round Robin",
  "modelChain.primaryAttempts": "Primary attempts",
  "modelChain.requestTimeout": "Request timeout",
  "modelChain.firstTokenTimeout": "First token timeout",
  "modelChain.totalStreamTimeout": "Total stream timeout",
  "modelChain.addModel": "Add Model",
  "modelChain.addAtLeastOne": "Add at least one model",
  "modelChain.providerPlaceholder": "Provider",
  "modelChain.modelPlaceholder": "Model",
  "modelChain.dragToReorder": "Drag to reorder",
  "modelChain.economyPreset": "Economy / Local preset",
  "modelChain.economyFastLabel": "Fast / cheap (haiku, flash, mini, :free…)",
  "modelChain.economyFastPlaceholder": "Skip this slot",
  "modelChain.economyMidLabel": "Mid-tier",
  "modelChain.economyMidPlaceholder": "Skip this slot",
  "modelChain.economyLocalLabel": "Local / last-resort",
  "modelChain.economyLocalPlaceholder": "Skip this slot",
  "modelChain.createEconomyPreset": "Create Economy/Local preset",

  // ── OpenAI Gateway ──
  "openaiGateway.title": "OpenAI Gateway",
  "openaiGateway.description":
    "Expose this local daemon as an OpenAI-compatible endpoint.",
  "openaiGateway.unableToLoad": "Unable to load gateway details",
  "openaiGateway.modelsSearchPlaceholder": "Search models…",
  "openaiGateway.refreshModels": "Refresh models",
  "openaiGateway.failedToLoadModels": "Failed to load models",
  "openaiGateway.apiBase": "API Base",
  "openaiGateway.chatCompletionsEndpoint": "Chat Completions",
  "openaiGateway.modelsEndpoint": "Models",
  "openaiGateway.exampleUsage": "Example Usage",
  "openaiGateway.curlExample": "cURL",
  "openaiGateway.exampleModel": "Example Model",
  "openaiGateway.availableModels": "Available Models",
  "openaiGateway.modelsCount": "{count} models",

  // ── History ──
  "history.title": "History",
  "history.description":
    "Session timeline, routed models, provider stats, and request log.",
  "history.noSessionsYet": "No sessions recorded yet.",
  "history.clearArchivedHistory": "Clear archived history?",
  "history.clearHistoryConfirm":
    "This will permanently remove all archived sessions. Current sessions are not affected.",
  "history.clear": "Clear",
  "history.sessionsCount": "Sessions",
  "history.topProvider": "Top Provider",
  "history.mostUsedModel": "Most Used Model",
  "history.requests": "Requests",
  "history.tokens": "Tokens",
  "history.sessions": "Sessions",

  // ── History Details ──
  "historyDetails.requestId": "ID",
  "historyDetails.timestamp": "Timestamp",
  "historyDetails.requestedModel": "Requested Model",
  "historyDetails.providerModel": "Provider Model",
  "historyDetails.inputTokens": "Input Tokens",
  "historyDetails.outputTokens": "Output Tokens",
  "historyDetails.latencyMs": "Latency (ms)",
  "historyDetails.status": "Status",
  "historyDetails.error": "Error",
  "historyDetails.prompt": "Prompt",
  "historyDetails.providerRequestPreview": "Provider Request Preview",
  "historyDetails.response": "Response",
  "historyDetails.sessionDetails": "Session Details",
  "historyDetails.sessionMetadata": "Session Metadata",
  "historyDetails.modelsUsed": "Models Used",
  "historyDetails.providersTable": "Session Providers",
  "historyDetails.requestLog": "Request Log",
  "historyDetails.noRequestsYet": "No requests yet",
  "historyDetails.deleteSession": "Delete Session",
  "historyDetails.deleteSessionConfirm": "Delete this session?",

  // ── Server Logs ──
  "logs.title": "Server Logs",
  "logs.description":
    "Real-time gateway log stream — up to 5,000 lines buffered",
  "logs.searchPlaceholder": "Search logs…",
  "logs.toggleLineNumbers": "Toggle line numbers",
  "logs.toggleWordWrap": "Toggle word wrap",
  "logs.clearLogBuffer": "Clear log buffer",
  "logs.downloadLog": "Download full log buffer as .log file",
  "logs.scrollToBottom": "Scroll to bottom",
  "logs.noLogs": "No log entries yet",

  // ── Settings ──
  "settings.title": "Settings",
  "settings.description":
    "Manage gateway configuration, integrations, and tools.",
  "settings.server": "Server",
  "settings.webTools": "Web Tools",
  "settings.outboundProxy": "Outbound Proxy",
  "settings.tokenSavers": "Token Savers",
  "settings.portRestartInfo":
    "Port and proxy changes require a gateway restart to take effect.",
  "settings.containerRestartInfo":
    "Outbound proxy changes require a container restart. Port changes are managed by Docker compose before startup.",

  // ── Settings: Server ──
  "settings.server.proxyPort": "Proxy Port",
  "settings.server.panelPort": "Panel Port",
  "settings.server.authToken": "Auth Token",
  "settings.server.dockerNotice":
    "Docker publishes this port from docker-compose.yml. Port changes require recreating the container.",

  // ── Settings: Web Tools ──
  "settings.webTools.enableSearch": "Enable web_search / web_fetch",
  "settings.webTools.enableSearchDesc":
    "Allows Claude to search the web and fetch URLs",
  "settings.webTools.allowPrivate": "Allow private networks",
  "settings.webTools.allowPrivateDesc":
    "Permit fetching RFC1918 addresses (192.168.x, 10.x…)",

  // ── Settings: Outbound Proxy ──
  "settings.proxy.enable": "Enable",
  "settings.proxy.url": "Proxy URL",
  "settings.proxy.urlPlaceholder": "http://127.0.0.1:7890",

  // ── Settings: Token Savers ──
  "settings.tokenSavers.rtkTitle": "RTK compression",
  "settings.tokenSavers.rtkDesc":
    "Compact large tool results before provider dispatch",
  "settings.tokenSavers.cavemanTitle": "Caveman mode",
  "settings.tokenSavers.cavemanDesc":
    "Inject terse-response guidance into the system prompt",
  "settings.tokenSavers.cavemanLevel": "Caveman mode level",

  // ── Live Sessions ──
  "liveSession.title": "Live Sessions",
  "liveSession.noActiveSessions": "No active sessions",
  "liveSession.providers": "Providers",
  "liveSession.models": "Models",
  "liveSession.requestLog": "Request Log",
  "liveSession.noRequestsYet": "No requests yet",
  "liveSession.sessionProviders": "Session Providers",
  "liveSession.cavemanTag": "Caveman ({level})",

  // ── Copilot OAuth ──
  "copilot.devicePrompt": "Device Activation",
  "copilot.enterCode": "Enter the code",
  "copilot.onUrl": "at",
  "copilot.expiresAt": "Expires at",
  "copilot.waiting": "Waiting for activation…",
  "copilot.activated": "Activated!",
  "copilot.expired": "Expired",

  // ── Status Labels ──
  "status.all": "All",
  "status.enabled": "Enabled",
  "status.disabled": "Disabled",
  "status.configured": "Configured",
  "status.notConfigured": "Not Configured",
  "status.ok": "OK",
  "status.pending": "Pending",
};

export default en;
