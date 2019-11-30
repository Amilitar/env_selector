const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const {Enviroment} = Me.imports.enviroment;
const Lang = imports.lang;

let tray_env_text_label = null;

class EnviromentManager {
    constructor(enviromentFilePath) {
        this.enviromentFilePath = enviromentFilePath;
        this._createEnviroments();
        this.current_env = this.getCurrentEnviroment();
        this.setDropdownMenu();
    }

    _createEnviroments() {
        this.enviroments = this._get_allowed_envs()
    }

    _get_allowed_envs() {
        // let fname = GLib.getenv("ENVIROMENT_FILE_PATH");
        let source_enviroments = GLib.spawn_command_line_sync("cat " + this.enviromentFilePath)[1].toString();
        let enviroments = [];
        let enviroment = "";
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
        if (options[0] !== undefined && options[0] === "#" && options[1] !== undefined) {
            if (options[1] === "common") {
                return options[1];
            } else if (options[1] === "enviroment") {
                return options[2];
            }
        }
        return undefined;
    }

    setDropdownMenu() {
        let styleClass = "enviroment";
        if (this.current_env.isImportant()) {
            styleClass = "enviromentImportant";
        }

        tray_env_text_label = new St.Label({
            text: this.current_env.getName(),
            style_class: styleClass
        });

        // 1 - выравнивание меню относительно кнопки(1 - слева, 0 - справа, 0.5 - по центру)
        // true, если автоматически создавать меню
        let enviromentsButton = new PanelMenu.Button(0.5, "DoNotDisturb", false);
        // `right` - где мы хотим увидеть кнопку (left/center/right)
        Main.panel.addToStatusArea("DoNotDisturbRole", enviromentsButton, 0, "center");
        let box = new St.BoxLayout();
        box.add_child(tray_env_text_label);
        enviromentsButton.actor.add_child(box);

        this.createEnviromentMenu(enviromentsButton);
    }

    createEnviromentMenu(enviromentsButton) {
        let handle = this;
        this.enviroments.forEach(function (enviroment) {
            if (enviroment.isVisible()) {
                let menuItem = new PopupMenu.PopupMenuItem(enviroment.getName());
                menuItem.connect("activate", Lang.bind({envManager: handle, enviroment: enviroment}, function () {
                    if (this.enviroment.isImportant()) {
                        tray_env_text_label.style_class = "enviromentImportant";
                    } else {
                        tray_env_text_label.style_class = "enviroment";
                    }

                    this.envManager.setCurrentEnviroment(this.enviroment);
                    tray_env_text_label.text = this.enviroment.getName();
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

    destroy() {
        /*
        This call the parent destroy function
        */
        this.parent();
    }
}