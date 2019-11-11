import { layers, oneHot, Rank, Sequential, sequential, Tensor, tensor2d, train } from "@tensorflow/tfjs-node";
import fs from "fs";
import path from "path";

interface Data {
    input: Tensor<Rank>;
    output: Tensor<Rank>;
}

const shuffleArrays = (array1: any[], array2: any[]) => {
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

const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

let model: Sequential; // global variable to store the neural net

// defines the architecture of the neural net
function defineModel() {
    model = sequential();
    model.add(layers.conv2d({
        activation: "relu",
        filters: 8,
        inputShape: [36, 36, 1],
        kernelInitializer: "varianceScaling",
        kernelSize: 5,
        strides: 1
    }));
    model.add(layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));
    model.add(layers.conv2d({
        activation: "relu",
        filters: 16,
        kernelInitializer: "varianceScaling",
        kernelSize: 5,
        strides: 1,
    }));
    model.add(layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));
    model.add(layers.flatten());
    model.add(layers.dense({ units: 3, activation: "softmax" }));
    const optimizer = train.adam();
    model.compile({ optimizer, loss: "categoricalCrossentropy", metrics: ["accuracy"] });
}

// loads the data from harddrive and reshapes it into tensors
const openData = (): { test: Data, train: Data } => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../", "data", "data36.json"), "utf8"));
    shuffleArray(data.Grundriss);
    shuffleArray(data.Zimmer);
    shuffleArray(data.Fassade);
    const trainImages = [
        ...data.Grundriss.slice(0, 1000),
        ...data.Zimmer.slice(0, 1000),
        ...data.Fassade.slice(0, 1000)
    ].map((pixels) => pixels.map((num: number) => num / 255));
    const trainLabels = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 1000; j++) {
            trainLabels.push(i);
        }
    }
    const testImages = [...data.Grundriss.slice(1000), ...data.Zimmer.slice(1000), ...data.Fassade.slice(1000)]
        .map((pixels) => pixels.map((num: number) => num / 255));
    const testLabels = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 160; j++) {
            testLabels.push(i);
        }
    }
    shuffleArrays(trainLabels, trainImages);
    shuffleArrays(testLabels, testImages);

    const trainInput = tensor2d(trainImages, [3000, 1296]).reshape([3000, 36, 36, 1]);
    const trainOutput = oneHot(trainLabels, 3);
    const testInput = tensor2d(testImages, [480, 1296]).reshape([480, 36, 36, 1]);
    const testOutput = oneHot(testLabels, 3);

    return { train: { input: trainInput, output: trainOutput }, test: { input: testInput, output: testOutput } };
};

// starts the training process
async function trainModel(data: Data, epochs: number) {
    await model.fit(data.input, data.output, {
        callbacks: {
            onEpochEnd: (epoch, log) => console.log(`Epoch ${epoch}: loss = ${log.loss}`)
        },
        epochs
    });
    try {
        await model.save("file://" + path.join(__dirname, "../", "/saved", Date.now() + ""));
        console.log("model saved!");
    } catch (e) {
        console.log(e);
    }
}

// tests the model using the test-dataset
async function testModel(testData: Data) {
    const result: number[] = await (model.predict(testData.input) as Tensor<Rank>).argMax(1).array() as number[];
    const output: number[] = await testData.output.argMax(1).array() as number[];
    let errorCount = 0;
    for (let i = 0; i < output.length; i++) {
        if (output[i] !== result[i]) {
            errorCount += 1;
        }
    }
    console.log(errorCount + " errors, " + (errorCount * 100 / output.length) + "% error rate");
}

// main function to run the script asynchronously
async function main() {
    const data = openData();
    defineModel();
    await trainModel(data.train, 100);
    await testModel(data.test);
}

// start
main();
