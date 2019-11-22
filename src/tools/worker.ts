import { LayersModel, loadLayersModel, Rank, Tensor, tensor } from "@tensorflow/tfjs-node";
import path from "path";
import workerpool from "workerpool";

// variable to store the neural net
let model: LayersModel;

// main function to be executed by the worker
async function predict(input: { type: string, data: number[] }): Promise<string> {
    try {
        if (!model) {
            model = await loadLayersModel(
                "file://" + path.join(__dirname, "../", "../", "saved", "1573478850870", "model.json"));
        }

        const pixels = input.data
            .filter((num, index) => index % 3 === 0)
            .map((num) => num / 255);

        const pixelTensor = tensor(pixels, [1, 36, 36, 1]);
        const resultTensor = model.predict(pixelTensor) as Tensor<Rank>;
        const resultVector = await resultTensor.argMax(1).array() as number[];
        if (resultVector[0] === 0) {
            return "Grundriss";
        }
        if (resultVector[0] === 1) {
            return "Zimmer";
        }
        return "Fassade";
    } catch (e) {
        return "undefined";
    }
}

workerpool.worker({
    predict
});
