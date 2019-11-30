const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


const {EnviromentManager} = Me.imports.enviromentManager;

let enviromentManager;

function init() {
}

function enable() {
    enviromentManager = new EnviromentManager("/home/abdrashitov/shell/environments.sh");
} // вызывается при включении; создаем все здесь

function disable() {
    enviromentManager.destroy()
} // --||-- выключении; удаляем все созданное в enable()

// journalctl /usr/bin/gnome-shell | grep 'env_selector' | tail -10