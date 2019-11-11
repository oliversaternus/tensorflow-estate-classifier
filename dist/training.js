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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const shuffleArrays = (array1, array2) => {
    if (array1.length !== array2.length) {
        console.error("Wrong Array Lengths!");
        return;
    }
    for (let i = array1.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array1[i], array1[j]] = [array1[j], array1[i]];
        [array2[i], array2[j]] = [array2[j], array2[i]];
    }
};
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};
let model; // global variable to store the neural net
// defines the architecture of the neural net
function defineModel() {
    model = tfjs_node_1.sequential();
    model.add(tfjs_node_1.layers.conv2d({
        activation: "relu",
        filters: 8,
        inputShape: [36, 36, 1],
        kernelInitializer: "varianceScaling",
        kernelSize: 5,
        strides: 1
    }));
    model.add(tfjs_node_1.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));
    model.add(tfjs_node_1.layers.conv2d({
        activation: "relu",
        filters: 16,
        kernelInitializer: "varianceScaling",
        kernelSize: 5,
        strides: 1,
    }));
    model.add(tfjs_node_1.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));
    model.add(tfjs_node_1.layers.flatten());
    model.add(tfjs_node_1.layers.dense({ units: 3, activation: "softmax" }));
    const optimizer = tfjs_node_1.train.adam();
    model.compile({ optimizer, loss: "categoricalCrossentropy", metrics: ["accuracy"] });
}
// loads the data from harddrive and reshapes it into tensors
const openData = () => {
    const data = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "../", "data", "data36.json"), "utf8"));
    shuffleArray(data.Grundriss);
    shuffleArray(data.Zimmer);
    shuffleArray(data.Fassade);
    const trainImages = [
        ...data.Grundriss.slice(0, 1000),
        ...data.Zimmer.slice(0, 1000),
        ...data.Fassade.slice(0, 1000)
    ].map((pixels) => pixels.map((num) => num / 255));
    const trainLabels = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 1000; j++) {
            trainLabels.push(i);
        }
    }
    const testImages = [...data.Grundriss.slice(1000), ...data.Zimmer.slice(1000), ...data.Fassade.slice(1000)]
        .map((pixels) => pixels.map((num) => num / 255));
    const testLabels = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 160; j++) {
            testLabels.push(i);
        }
    }
    shuffleArrays(trainLabels, trainImages);
    shuffleArrays(testLabels, testImages);
    const trainInput = tfjs_node_1.tensor2d(trainImages, [3000, 1296]).reshape([3000, 36, 36, 1]);
    const trainOutput = tfjs_node_1.oneHot(trainLabels, 3);
    const testInput = tfjs_node_1.tensor2d(testImages, [480, 1296]).reshape([480, 36, 36, 1]);
    const testOutput = tfjs_node_1.oneHot(testLabels, 3);
    return { train: { input: trainInput, output: trainOutput }, test: { input: testInput, output: testOutput } };
};
// starts the training process
function trainModel(data, epochs) {
    return __awaiter(this, void 0, void 0, function* () {
        yield model.fit(data.input, data.output, {
            callbacks: {
                onEpochEnd: (epoch, log) => console.log(`Epoch ${epoch}: loss = ${log.loss}`)
            },
            epochs
        });
        try {
            yield model.save("file://" + path_1.default.join(__dirname, "../", "/saved", Date.now() + ""));
            console.log("model saved!");
        }
        catch (e) {
            console.log(e);
        }
    });
}
// tests the model using the test-dataset
function testModel(testData) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield model.predict(testData.input).argMax(1).array();
        const output = yield testData.output.argMax(1).array();
        let errorCount = 0;
        for (let i = 0; i < output.length; i++) {
            if (output[i] !== result[i]) {
                errorCount += 1;
            }
        }
        console.log(errorCount + " errors, " + (errorCount * 100 / output.length) + "% error rate");
    });
}
// main function to run the script asynchronously
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = openData();
        defineModel();
        yield trainModel(data.train, 100);
        yield testModel(data.test);
    });
}
// start
main();
//# sourceMappingURL=training.js.map