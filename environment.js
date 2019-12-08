const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const commonConst = Me.imports.const.commonConst;

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
                let variable_options = variable_str.split(commonConst.SPACE);
                return variable_options[0] !== undefined &&
                    variable_options[0] !== commonConst.SHARP &&
                    variable_options[0] === "export";
            });
        }
        return active;
    }

    _parseEnvironmentParameters(sourceString) {
        let options = sourceString.split(commonConst.SPACE);
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
            handle.environmentVariables[index] = commonConst.SHARP + commonConst.SPACE + value
        });
    }

    activate() {
        if (this.isActive()) return;
        let handle = this;
        this.environmentVariables.forEach(function (value, index) {
            let variable_options = value.split(commonConst.SPACE);
            if (variable_options[0] === commonConst.SHARP) {
                variable_options.shift();
            }
            handle.environmentVariables[index] = variable_options.join(commonConst.SPACE)
        });
    }

    toString() {
        let environmentContent = commonConst.SHARP + commonConst.SPACE;
        if (!this.isVisible()) {
            environmentContent += this.getName();
        } else {
            environmentContent += commonConst.ENVIRONMENT + commonConst.SPACE + this.getName();
        }

        if (this.isImportant()) {
            environmentContent += commonConst.SPACE + commonConst.IMPORTANT;
        }

        environmentContent += commonConst.ENTER;

        this.environmentVariables.forEach(function (value, index) {
            environmentContent += value + commonConst.ENTER
        });
        return environmentContent;
    }
}