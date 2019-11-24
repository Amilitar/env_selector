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
    constructor() {
        this.current_env = "alfa";
        this.setDropdownMenu();
    }

    _get_allowed_envs() {
        // let fname = GLib.getenv("ENVIROMENT_FILE_PATH");
        let source_enviroments = GLib.spawn_command_line_sync("cat /home/abdrashitov/shell/environments.sh")[1].toString();
        let enviroments = [];
        let category = "";
        let prevCategory = "";
        let enviroment = "";
        let handler = this;
        source_enviroments.split("\n").forEach(function (line) {
            if (line !== undefined && line !== "") {
                if (line === "# common") {
                    category = handler._getClearEnviromentName(line);
                } else if (line.search("# enviroment") !== -1) {
                    let enviroment_name = handler._getClearEnviromentName(line);
                    let enviroment = new Enviroment(enviroment_name);
                    enviroments.push(enviroment);
                }
            }
        });

        return enviroments;
    }

    _getClearEnviromentName(sourceEnviroment) {
        return sourceEnviroment.replace("enviroment", "").replace("#", "").replace(" ", "")
    }


    setDropdownMenu() {
        tray_env_text_label = new St.Label({
            text: this.current_env,
            style_class: 'example-style'
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
        this._get_allowed_envs().forEach(function (enviroment) {
            let menuItem = new PopupMenu.PopupMenuItem(enviroment.getName());
            menuItem.connect("activate", Lang.bind(enviroment, function () {
                tray_env_text_label.text = this.getName();
            }));

            enviromentsButton.menu.addMenuItem(menuItem);
        });
    }

    destroy() {
        /*
        This call the parent destroy function
        */
        this.parent();
    }
}