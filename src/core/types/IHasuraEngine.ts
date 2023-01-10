import { IStatelessPlugin } from "./IStatelessPlugin";

export interface IAction {
  name: string;
  path: string;
  grapqhl_path: string;
  setting_path: string;
}

export interface IHasuraEngine {
  pluginName: string;
  actionPlugins: IStatelessPlugin[];

  exportMetadata(): Promise<void>;
  applyMetadata(): Promise<void>;
  applyMigrate(): Promise<void>;
  reapplyActions(): Promise<void>;
  reapplyEvents(): Promise<void>;
}
