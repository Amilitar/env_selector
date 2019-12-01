const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const commonConst = Me.imports.commonConst;
const {EnviromentManager} = Me.imports.enviromentManager;

let enviromentManager;

function _getConfigDirectoryPath() {
    let directoryPath = GLib.build_filenamev([GLib.get_user_config_dir(), commonConst.ENV_SELECTOR]);

    let directory = Gio.File.new_for_path(directoryPath);
    if (!directory.query_exists(null)) {
        directory.make_directory(null);
        let scriptPath = GLib.build_filenamev([directoryPath, commonConst.CONFIG_FOLDER]);
        GLib.file_set_contents(scriptPath, commonConst.PATH_TO_ENV_FILE);
    }
    return directoryPath
}

function init() {
}

function enable() {
    let directoryPath = _getConfigDirectoryPath();

    let scriptPath = GLib.build_filenamev([directoryPath, commonConst.CONFIG_FOLDER]);

    enviromentManager = new EnviromentManager(scriptPath);
}

function disable() {
    if (enviromentManager !== undefined) {
        enviromentManager.destroy()
    }
}