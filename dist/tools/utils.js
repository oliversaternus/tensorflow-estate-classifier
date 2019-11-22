"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const sharp_1 = __importDefault(require("sharp"));
const workerpool_1 = __importDefault(require("workerpool"));
const alphabet = "VZx9bXuv0y5lIBJst2MpF6A7LDinQmC3o4fPwKEjkGrzgOhqaWH1cNde8Y";
// worker pool to execute tensorflow code
const pool = workerpool_1.default.pool(__dirname + "/worker.js");
// classifies image buffer
function classify(image) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageData = yield sharp_1.default(image)
            .resize(36, 36)
            .modulate({ saturation: 0 })
            .raw()
            .toBuffer();
        const result = yield pool.exec("predict", [imageData]);
        return result;
    });
}
exports.classify = classify;
function generateId() {
    let result = "";
    for (let i = 0; i < 12; i++) {
        result += alphabet[Math.floor((Math.random() * 58))];
    }
    return result + Date.now();
}
exports.generateId = generateId;
function randomString(length) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += alphabet[Math.floor((Math.random() * 58))];
    }
    return result;
}
exports.randomString = randomString;
function deploy(repoName) {
    child_process_1.default.exec("source ./deploy-" + repoName + ".sh", { cwd: "/home/static-server/scripts", shell: "/bin/bash" }, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            console.log(stderr);
        }
        console.log(stdout);
    });
}
exports.deploy = deploy;
//# sourceMappingURL=utils.js.map