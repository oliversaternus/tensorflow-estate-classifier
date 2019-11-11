import { LayersModel, loadLayersModel, Rank, Tensor, tensor } from "@tensorflow/tfjs-node";
import childProcess from "child_process";
import path from "path";
import sharp from "sharp";

const alphabet: string = "VZx9bXuv0y5lIBJst2MpF6A7LDinQmC3o4fPwKEjkGrzgOhqaWH1cNde8Y";
let model: LayersModel; // variable to store the neural net

// returns the recognized class
async function predict(inputTensor: Tensor<Rank>): Promise<string> {
    const resultTensor = model.predict(inputTensor) as Tensor<Rank>;
    const result: number[] = await resultTensor.argMax(1).array() as number[];
    if (result[0] === 0) {
        return "Grundriss";
    }
    if (result[0] === 1) {
        return "Zimmer";
    }
    return "Fassade";
}

// loads the pretrained model
export async function loadModel() {
    model = await loadLayersModel(
        "file://" + path.join(__dirname, "../", "../", "saved", "1573478850870", "model.json"));
}

// classifies image buffer
export async function classify(image: Buffer) {
    const imageData = await sharp(image)
        .resize(36, 36)
        .modulate({ saturation: 0 })
        .raw()
        .toBuffer();

    const pixels = imageData.toJSON().data
        .filter((num, index) => index % 3 === 0)
        .map((num) => num / 255);
    const pixelTensor = tensor(pixels, [1, 36, 36, 1]);
    return await predict(pixelTensor);
}

export function generateId(): string {
    let result: string = "";
    for (let i = 0; i < 12; i++) {
        result += alphabet[Math.floor((Math.random() * 58))];
    }
    return result + Date.now();
}

export function randomString(length: number): string {
    let result: string = "";
    for (let i = 0; i < length; i++) {
        result += alphabet[Math.floor((Math.random() * 58))];
    }
    return result;
}

export function deploy(repoName: string) {
    childProcess.exec("source ./deploy-" + repoName + ".sh",
        { cwd: "/home/static-server/scripts", shell: "/bin/bash" },
        (err: childProcess.ExecException, stdout: string, stderr: string) => {
            if (err) {
                console.error(err);
                console.log(stderr);
            }
            console.log(stdout);
        });
}
