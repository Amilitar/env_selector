const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const {Enviroment} = Me.imports.enviroment;
const commonConst = Me.imports.commonConst;
const Lang = imports.lang;


class EnviromentManager {
    constructor(scriptPath) {
        this.scriptPath = scriptPath;

        this._createExtension()
    }

    _createExtension() {
        this.enviromentsButton = null;
        this.box = null;
        this.menuItems = [];
        this.tray_env_text_label = null;

        this.enviromentFilePath = GLib.spawn_command_line_sync("cat " + this.scriptPath)[1].toString();

        if (this.enviromentFilePath === commonConst.PATH_TO_ENV_FILE || this.enviromentFilePath === commonConst.EMPTY) {
            Main.notifyError(_("Please specify file to env path in " + this.scriptPath));
            this.setDropdownMenu("Specify config!", "enviromentTopLabelImportant");
        } else {
            this._createEnviroments();
        }
        this._createConfigurationMenu(this.enviromentsButton)
    }

    _createEnviroments() {
        this.enviroments = this._get_allowed_envs();
        this.current_env = this.getCurrentEnviroment();

        let styleClass = "enviromentTopLabel";
        if (this.current_env.isImportant()) {
            styleClass = "enviromentTopLabelImportant";
        }

        this.setDropdownMenu(this.current_env.getName(), styleClass);
        this._createEnviromentMenu(this.enviromentsButton);
    }

    _get_allowed_envs() {
        let source_enviroments = GLib.spawn_command_line_sync("cat " + this.enviromentFilePath)[1].toString();
        let enviroments = [];
        let enviroment = null;
        let handler = this;
        source_enviroments.split("\n").forEach(function (line) {
            if (line !== undefined && line !== "") {
                let enviroment_name = handler._getClearEnviromentName(line);
                if (enviroment_name !== undefined) {
                    enviroment = new Enviroment(line);
                    enviroments.push(enviroment);
                } else {
                    enviroment.setEnviromentVariable(line)
                }
            }
        });
        return enviroments;
    }

    /**
     * Return env description based on  mask # enviroment alfa
     * @param sourceString
     * @returns {string}
     * @private
     */
    _getClearEnviromentName(sourceString) {
        let options = sourceString.split(" ");
        if (options[0] !== undefined && options[0] === commonConst.SHARP && options[1] !== undefined) {
            if (options[1] === commonConst.COMMON) {
                return options[1];
            } else if (options[1] === commonConst.ENVIROMENT) {
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

        this.enviromentsButton = new PanelMenu.Button(0.5, "EnviromentMenuButton", false);

        Main.panel.addToStatusArea("EnviromentMenuRole", this.enviromentsButton, 0, "center");
        this.box = new St.BoxLayout();
        this.box.add_child(this.tray_env_text_label);
        this.enviromentsButton.actor.add_child(this.box);
    }

    _createConfigurationMenu(enviromentsButton) {
        enviromentsButton.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let menuItem = new PopupMenu.PopupMenuItem("Reload...");
        menuItem.style_class = "menuItem";
        menuItem.connect("activate", Lang.bind(this, function () {
            this.destroy();
            this._createExtension();
        }));
        this.menuItems.push(menuItem);
        enviromentsButton.menu.addMenuItem(menuItem);
    }

    _createEnviromentMenu(enviromentsButton) {
        let handle = this;
        this.enviroments.forEach(function (enviroment) {
            if (enviroment.isVisible()) {
                let menuItem = new PopupMenu.PopupMenuItem(enviroment.getName());
                handle.menuItems.push(menuItem);
                if (enviroment.isImportant()) {
                    menuItem.style_class = commonConst.ENVIROMENT_IMPORTANT;
                } else {
                    menuItem.style_class = commonConst.ENVIROMENT;
                }

                menuItem.connect("activate", Lang.bind({envManager: handle, enviroment: enviroment}, function () {
                    if (this.enviroment.isImportant()) {
                        this.envManager.tray_env_text_label.style_class = commonConst.ENVIROMENT_IMPORTANT;
                    } else {
                        this.envManager.tray_env_text_label.style_class = commonConst.ENVIROMENT;
                    }

                    this.envManager.setCurrentEnviroment(this.enviroment);
                    this.envManager.tray_env_text_label.text = this.enviroment.getName();
                }));

                enviromentsButton.menu.addMenuItem(menuItem);
            }
        });
    }

    setCurrentEnviroment(enviroment) {
        let currentEnviroment = this.getCurrentEnviroment();
        if (currentEnviroment.getName() !== enviroment.getName()) {
            currentEnviroment.deactivate();
            enviroment.activate();
            this._saveEnviroments();
        }
    }

    _saveEnviroments() {
        let newEnviromentsContent = "";
        this.enviroments.forEach(function (value) {
            newEnviromentsContent += value.toString() + "\n";
        });
        GLib.file_set_contents(this.enviromentFilePath, newEnviromentsContent);
    }

    getCurrentEnviroment() {
        return this.enviroments.find(function (enviroment) {
            return enviroment.isActive();
        });
    }

    _destroy(element) {
        if (element != null) {
            element.destroy();
        }
    }

    destroy() {
        if (this.tray_env_text_label !== undefined) {
            this.tray_env_text_label.destroy();
        }
        this._destroy(this.enviromentsButton);
        this._destroy(this.box);
        let handle = this;
        if (this.menuItems !== undefined) {
            this.menuItems.forEach(function (menuItem) {
                handle._destroy(menuItem);
            });
        }

        this.enviroments = null;
    }
}