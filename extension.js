const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;

const commonConst = Me.imports.commonConst;
const {EnviromentManager} = Me.imports.enviromentManager;

let enviromentManager;

function init() {
}

function enable() {

    let directoryPath = GLib.build_filenamev([GLib.get_user_config_dir(), "env_selector"]);

    let directory = Gio.File.new_for_path(directoryPath);
    if (!directory.query_exists(null)) {
        directory.make_directory(null);
        let scriptPath = GLib.build_filenamev([directoryPath, commonConst.CONFIG_FOLDER]);
        GLib.file_set_contents(scriptPath, commonConst.PATH_TO_ENV_FILE);
    }

    let scriptPath = GLib.build_filenamev([directoryPath, commonConst.CONFIG_FOLDER]);

    let enviromentPath = GLib.spawn_command_line_sync("cat " + scriptPath)[1].toString();
    if (enviromentPath === commonConst.PATH_TO_ENV_FILE || enviromentPath === commonConst.EMPTY) {
        Main.notifyError(_("Please specify file to env path in " + scriptPath));
    } else {
        enviromentManager = new EnviromentManager(enviromentPath);
    }
}

function disable() {
    if (enviromentManager !== undefined) {
        enviromentManager.destroy()
    }
}

// journalctl /usr/bin/gnome-shell | grep 'env_selector' | tail -10