const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const commonConst = Me.imports.commonConst;

class Environment {
    constructor(source) {
        this.name = "Undefided";
        this.important = false;
        this.environmentVariables = [];
        this.source = source;
        this._parseEnvironmentParameters(this.source);
    }

    getName() {
        return this.name;
    }

    setEnvironmentVariable(environmentVariable) {
        this.environmentVariables.push(environmentVariable);
    }

    isVisible() {
        return this.name !== commonConst.COMMON;
    }

    isActive() {
        let active = false;
        if (this.isVisible()) {
            active = this.environmentVariables.some((variable_str) => {
                let variable_options = variable_str.split(" ");
                return variable_options[0] !== undefined && variable_options[0] !== commonConst.SHARP && variable_options[0] === "export";
            });
        }
        return active;
    }

    _parseEnvironmentParameters(sourceString) {
        let options = sourceString.split(" ");
        if (options[1] === commonConst.COMMON) {
            this.name = options[1];
        } else if (options[1] === commonConst.ENVIRONMENT) {
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
        this.environmentVariables.forEach(function (value, index) {
            handle.environmentVariables[index] = commonConst.SHARP + " " + value
        });
    }

    activate() {
        if (this.isActive()) return;
        let handle = this;
        this.environmentVariables.forEach(function (value, index) {
            let variable_options = value.split(" ");
            if (variable_options[0] === commonConst.SHARP) {
                variable_options.shift();
            }
            handle.environmentVariables[index] = variable_options.join(" ")
        });
    }

    toString() {
        let environmentContent = commonConst.SHARP + " ";
        if (!this.isVisible()) {
            environmentContent += this.getName();
        } else {
            environmentContent += "environment " + this.getName();
        }

        if (this.isImportant()) {
            environmentContent += " " + commonConst.IMPORTANT;
        }

        environmentContent += "\n";

        this.environmentVariables.forEach(function (value, index) {
            environmentContent += value + "\n"
        });
        return environmentContent;
    }
}