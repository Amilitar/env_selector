const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const {Environment} = Me.imports.environment;
const commonConst = Me.imports.const.commonConst;
const messageConst = Me.imports.const.messageConst;
const Lang = imports.lang;


class EnvironmentManager {
    constructor(scriptPath) {
        this.scriptPath = scriptPath;

        this._createExtension()
    }

    _createExtension() {
        this.environmentsButton = null;
        this.box = null;
        this.menuItems = [];
        this.tray_env_text_label = null;

        this.environmentFilePath = GLib.spawn_command_line_sync(commonConst.CAT + this.scriptPath)[1].toString();

        if (this.environmentFilePath === commonConst.PATH_TO_ENV_FILE || this.environmentFilePath === commonConst.EMPTY) {
            Main.notifyError(_(messageConst.SPECIFY_CONFIG_NOTIFY_MESSAGE + this.scriptPath));
            this.setDropdownMenu(messageConst.SPECIFY_CONFIG_MESSAGE, commonConst.ENVIRONMENT_TOP_LABEL_IMPORTANT);
        } else {
            this._createEnvironments();
        }
        this._createConfigurationMenu(this.environmentsButton)
    }

    _createEnvironments() {
        this.environments = this._get_allowed_envs();
        this.current_env = this.getCurrentEnvironment();

        let styleClass = commonConst.ENVIRONMENT_TOP_LABEL;
        if (this.current_env.isImportant()) {
            styleClass = commonConst.ENVIRONMENT_TOP_LABEL_IMPORTANT;
        }

        this.setDropdownMenu(this.current_env.getName(), styleClass);
        this._createEnvironmentMenu(this.environmentsButton);
    }

    _get_allowed_envs() {
        let source_environments = GLib.spawn_command_line_sync(commonConst.CAT + this.environmentFilePath)[1].toString();
        let environments = [];
        let environment = null;
        let handler = this;
        source_environments.split(commonConst.ENTER).forEach(function (line) {
            if (line !== undefined && line !== commonConst.EMPTY) {
                let environment_name = handler._getClearEnvironmentName(line);
                if (environment_name !== undefined) {
                    environment = new Environment(line);
                    environments.push(environment);
                } else {
                    environment.setEnvironmentVariable(line)
                }
            }
        });
        return environments;
    }

    /**
     * Return env description based on  mask # environment alfa
     * @param sourceString
     * @returns {string}
     * @private
     */
    _getClearEnvironmentName(sourceString) {
        let options = sourceString.split(commonConst.SPACE);
        if (options[0] !== undefined && options[0] === commonConst.SHARP && options[1] !== undefined) {
            if (options[1] === commonConst.COMMON) {
                return options[1];
            } else if (options[1] === commonConst.ENVIRONMENT) {
                return options[2];
            }
        }
        return undefined;
    }

    setDropdownMenu(startName, styleClass) {
        this.tray_env_text_label = new St.Label({
            text: startName,
            style_class: styleClass
        });

        this.environmentsButton = new PanelMenu.Button(0.5, "EnvironmentMenuButton", false);

        Main.panel.addToStatusArea("EnvironmentMenuRole", this.environmentsButton, 0, "center");
        this.box = new St.BoxLayout();
        this.box.add_child(this.tray_env_text_label);
        this.environmentsButton.add_child(this.box);
    }

    _createConfigurationMenu(environmentsButton) {
        environmentsButton.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let menuItem = new PopupMenu.PopupMenuItem(messageConst.RELOAD_MESSAGE);
        menuItem.style_class = commonConst.MENU_ITEM;
        menuItem.connect(commonConst.ACTIVATE, Lang.bind(this, function () {
            this.destroy();
            this._createExtension();
        }));
        this.menuItems.push(menuItem);
        environmentsButton.menu.addMenuItem(menuItem);
    }

    _createEnvironmentMenu(environmentsButton) {
        let handle = this;
        this.environments.forEach(function (environment) {
            if (environment.isVisible()) {
                let menuItem = new PopupMenu.PopupMenuItem(environment.getName());
                handle.menuItems.push(menuItem);
                if (environment.isImportant()) {
                    menuItem.style_class = commonConst.ENVIRONMENT_IMPORTANT;
                } else {
                    menuItem.style_class = commonConst.ENVIRONMENT;
                }

                menuItem.connect(commonConst.ACTIVATE, Lang.bind({
                    envManager: handle,
                    environment: environment
                }, function () {
                    if (this.environment.isImportant()) {
                        this.envManager.tray_env_text_label.style_class = commonConst.ENVIRONMENT_IMPORTANT;
                    } else {
                        this.envManager.tray_env_text_label.style_class = commonConst.ENVIRONMENT;
                    }

                    this.envManager.setCurrentEnvironment(this.environment);
                    this.envManager.tray_env_text_label.text = this.environment.getName();
                }));

                environmentsButton.menu.addMenuItem(menuItem);
            }
        });
    }

    setCurrentEnvironment(environment) {
        let currentEnvironment = this.getCurrentEnvironment();
        if (currentEnvironment.getName() !== environment.getName()) {
            currentEnvironment.deactivate();
            environment.activate();
            this._saveEnvironments();
        }
    }

    _saveEnvironments() {
        let newEnvironmentsContent = "";
        this.environments.forEach(function (value) {
            newEnvironmentsContent += value.toString() + "\n";
        });
        GLib.file_set_contents(this.environmentFilePath, newEnvironmentsContent);
    }

    getCurrentEnvironment() {
        return this.environments.find(function (environment) {
            return environment.isActive();
        });
    }

    _destroy(element) {
        if (element != null) {
            element.destroy();
        }
    }

    destroy() {
        let handle = this;
        if (this.menuItems !== undefined) {
            this.menuItems.forEach(function (menuItem) {
                handle._destroy(menuItem);
            });
        }

        this._destroy(this.box);
        this.environmentsButton.hide();
        this.environmentsButton.destroy();
        this.environments = null;
    }
}