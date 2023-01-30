import { GlueStackPlugin } from "src";
import IPlugin from "@gluestack/framework/types/plugin/interface/IPlugin";
import IHasContainerController from "@gluestack/framework/types/plugin/interface/IHasContainerController";

export function developDown(program: any, glueStackPlugin: GlueStackPlugin) {
  const command = program
    .command("develop:down")
    .argument(
      "[instance-name]",
      "Name of the container instance to down (optional)",
    )
    .description(
      "Stops provided container instances or all the containers if no instance is provided",
    )
    .action((instanceName: string) => runner(instanceName, glueStackPlugin));
}

export async function runner(
  instanceName: string,
  glueStackPlugin: GlueStackPlugin,
) {
  const instances = glueStackPlugin.app.getContainerTypePluginInstances(true);
  let downInstances: (IPlugin & IHasContainerController)[] = instances;
  let found = false;
  if (instanceName) {
    for (const instance of instances) {
      if (instance.getName() === instanceName) {
        found = true;
        downInstances = [instance];
        break;
      }
    }
    if (!found) {
      console.log(`Error: could not down ${instanceName} instance not found`);
      return;
    }
  }

  for (const instance of downInstances) {
    if (instance && instance?.containerController) {
      try {
        await instance.containerController.down();
      } catch (e) {
        console.log(
          `Failed: ${instance.getName()} instance could not be stopped`,
        );
        console.log("\x1b[33m\nError:\x1b[31m", e.message, "\x1b[0m");
      }
      console.log();
    }
  }
}
