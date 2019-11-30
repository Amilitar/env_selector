const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const commonConst = Me.imports.commonConst;

class Enviroment {
    constructor(source) {
        this.name = "Undefided";
        this.important = false;
        this.enviromentVariables = [];
        this.source = source;
        this._parseEnviromentParameters(this.source);
    }

    getName() {
        return this.name;
    }

    setEnviromentVariable(enviromentVariable) {
        this.enviromentVariables.push(enviromentVariable);
    }

    isVisible() {
        return this.name !== commonConst.COMMON;
    }

    isActive() {
        let active = false;
        if (this.isVisible()) {
            active = this.enviromentVariables.some((variable_str) => {
                let variable_options = variable_str.split(" ");
                return variable_options[0] !== undefined && variable_options[0] !== commonConst.SHARP && variable_options[0] === "export";
            });
        }
        return active;
    }

    _parseEnviromentParameters(sourceString) {
        let options = sourceString.split(" ");
        if (options[1] === commonConst.COMMON) {
            this.name = options[1];
        } else if (options[1] === commonConst.ENVIROMENT) {
            this.name = options[2];
            if (options.length === 4) {
                this.important = options[3] === commonConst.IMPORTANT;
            }
        }
    }

    isImportant() {
        return this.important;
    }

    deactivate() {
        if (!this.isActive()) return;
        let handle = this;
        this.enviromentVariables.forEach(function (value, index) {
            handle.enviromentVariables[index] = commonConst.SHARP + " " + value
        });
    }

    activate() {
        if (this.isActive()) return;
        let handle = this;
        this.enviromentVariables.forEach(function (value, index) {
            let variable_options = value.split(" ");
            if (variable_options[0] === commonConst.SHARP) {
                variable_options.shift();
            }
            handle.enviromentVariables[index] = variable_options.join(" ")
        });
    }

    toString() {
        let enviromentContent = commonConst.SHARP + " ";
        if (!this.isVisible()) {
            enviromentContent = this.getName();
        } else {
            enviromentContent = "enviroment " + this.getName();
        }

        if (this.isImportant()) {
            enviromentContent += " " + commonConst.IMPORTANT;
        }

        enviromentContent += "\n";

        this.enviromentVariables.forEach(function (value, index) {
            enviromentContent += value + "\n"
        });
        return enviromentContent;
    }
}