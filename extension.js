const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

let text, button;
let tray_env_text_label;
let current_env = "alfa";


function _showHello() {
    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
        monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
        { opacity: 0,
            time: 2,
            transition: 'easeOutQuad',
            onComplete: _hideHello });
}

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _get_allowed_envs() {
    return ["alfa", "beta", "delta", "wiskey"]
}

function init() {
    // button = new St.Bin({
    //     style_class: 'panel-button',
    //     reactive: true,
    //     can_focus: true,
    //     x_fill: true,
    //     y_fill: false,
    //     track_hover: true
    // });

    set_dropdown_menu();

    // tray_env_text_label = new St.Label({
    //     text: current_env,
    //     style_class: 'example-style'
    // });

    // button.set_child(tray_env_text_label);
    // button.connect('button-press-event', _showHello);
}

function set_dropdown_menu() {
    tray_env_text_label = new St.Label({
        text: current_env,
        style_class: 'example-style'
    });

    // 1 - выравнивание меню относительно кнопки(1 - слева, 0 - справа, 0.5 - по центру)
    // true, если автоматически создавать меню
    let dndButton = new PanelMenu.Button(0.5, "DoNotDisturb", false);
    // `right` - где мы хотим увидеть кнопку (left/center/right)
    Main.panel.addToStatusArea("DoNotDisturbRole", dndButton, 0, "center");
    let box = new St.BoxLayout();
    box.add_child(tray_env_text_label);
    dndButton.actor.add_child(box);
    _get_allowed_envs().forEach(function (env) {
        let menuItem = new PopupMenu.PopupMenuItem(env);
        menuItem.actor.connect('button-press-event', function(menuItem, event) {
            _showHello();
            tray_env_text_label.text = menuItem.toString();
        });

        dndButton.menu.addMenuItem(menuItem);
    });
}

function enable() {
} // вызывается при включении; создаем все здесь
function disable() {
} // --||-- выключении; удаляем все созданное в enable()
