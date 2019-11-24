class Enviroment {
    constructor(enviromentName) {
        this.name = enviromentName;
        this.active = false;
        this.enviromentVariables = [];
    }

    getName() {
        return this.name;
    }

    setEnviromentVariable(enviromentVariable) {
        this.enviromentVariables.push(enviromentVariable);
    }

}