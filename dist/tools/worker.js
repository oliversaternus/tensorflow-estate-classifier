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
const tfjs_node_1 = require("@tensorflow/tfjs-node");
const path_1 = __importDefault(require("path"));
const workerpool_1 = __importDefault(require("workerpool"));
// variable to store the neural net
let model;
// main function to be executed by the worker
function predict(input) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!model) {
            model = yield tfjs_node_1.loadLayersModel("file://" + path_1.default.join(__dirname, "../", "../", "saved", "1573478850870", "model.json"));
        }
        const pixels = input.data
            .filter((num, index) => index % 3 === 0)
            .map((num) => num / 255);
        const pixelTensor = tfjs_node_1.tensor(pixels, [1, 36, 36, 1]);
        const resultTensor = model.predict(pixelTensor);
        return resultTensor.argMax(1).array().then((result) => {
            if (result[0] === 0) {
                return "Grundriss";
            }
            if (result[0] === 1) {
                return "Zimmer";
            }
            return "Fassade";
        });
    });
}
workerpool_1.default.worker({
    predict
});
//# sourceMappingURL=worker.js.map