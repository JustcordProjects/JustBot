import { Command } from '@/bot/command.ts';
import { output } from '@/bot/logging.ts';
import { getCommandConfig } from '@/util/cmd/get-command-config.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { deepEqual } from '@/util/objects/objects.ts';

export class Plugin {
    private commands: Command[] = [];

    constructor(private category: string) {}

    public loadCommands(...commands: Command[]) {
        this.commands.push(...commands);
    }

    public getCommands() {
        return this.commands;
    }

    public getCategory() {
        return this.category;
    }
};

export default class PluginManager {
    private plugins: Plugin[] = [];

    public async loadPlugins() {
        for (const categoryEntry of Deno.readDirSync('src/plugins')) {
            if (!categoryEntry.isDirectory) continue;

            for (const pluginEntry of Deno.readDirSync('src/plugins/' + categoryEntry.name)) {
                const plugin = new Plugin(categoryEntry.name);

                for (const typeEntry of Deno.readDirSync(`src/plugins/${categoryEntry.name}/${pluginEntry.name}`)) {
                    // commands
                    if (typeEntry.name == 'commands') {
                        for (const commandEntry of Deno.readDirSync(`src/plugins/${categoryEntry.name}/${pluginEntry.name}/commands`)) {
                            const module = await import(`@/plugins/${categoryEntry.name}/${pluginEntry.name}/commands/${commandEntry.name}`);
                            
                            if (!module.default) {
                                output.warn('No default export found in command ' + commandEntry.name);
                                continue;
                            }
                            const command: Command = module.default;
                            const cmdCfg = getCommandConfig(command);

                            if (cmdCfg.enabled === false) {
                                if (deepEqual(command.permissions, CommandPermissions.devOnly()) || command.name == 'configuration') {
                                    output.warn('Dev-only command ' + command.name + ' should not be disabled. Leaving enabled.');
                                } else {
                                    continue;
                                }
                            }

                            plugin.loadCommands(command);
                        }
                    }
                }

                this.plugins.push(plugin);
            }
        }
    }

    public getPlugins(): Plugin[] {
        return this.plugins;
    }

    public getAllCommands(): Command[] {
        const result = [];
        for (const plugin of this.getPlugins()) {
            result.push(...plugin.getCommands());
        }
        return result;
    }
}

export const pluginManager = new PluginManager();
