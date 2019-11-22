import childProcess from "child_process";
import sharp from "sharp";
import workerpool from "workerpool";

const alphabet: string = "VZx9bXuv0y5lIBJst2MpF6A7LDinQmC3o4fPwKEjkGrzgOhqaWH1cNde8Y";
// worker pool to execute tensorflow code
const pool = workerpool.pool(__dirname + "/worker.js");

// classifies image buffer
export async function classify(image: Buffer) {
    const imageData = await sharp(image)
        .resize(36, 36)
        .modulate({ saturation: 0 })
        .raw()
        .toBuffer();

    const result: string = await pool.exec("predict", [imageData]);
    return result;
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
