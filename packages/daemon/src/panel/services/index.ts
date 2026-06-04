export {
  type LaunchEnvVars,
  type LaunchPrepareFailure,
  type LaunchPrepareRequest,
  type LaunchPrepareResult,
  prepareLaunch,
  resolveProviderFlag,
  shellQuote,
} from "./launch-prepare.js";
export {
  canUseHostShellIntegration,
  getShellSetup,
  getSnippetForShell,
  type InstallResult,
  type InstallStatus,
  installSnippet,
  type ShellInfo,
  type ShellName,
  type ShellSetupResponse,
} from "./shell-setup.js";
