import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import { createServer } from "http";
import path from "path";
import autoCatch from "./tools/catch";
import * as utils from "./tools/utils";

const app: express.Application = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

app.get("/", autoCatch(async (req, res) => {
    res.sendFile(path.join(__dirname, "../", "assets", "index.html"));
}));

app.get("/dist/bundle.js", autoCatch(async (req, res) => {
    res.sendFile(path.join(__dirname, "../", "assets", "bundle.js"));
}));

// #############################################################################

// classify images
app.post("/classify",
    autoCatch(async (req, res) => {
        const images: UploadedFile[] | UploadedFile = req.files.images;
        let classes: string[] = [];
        if (images && !(images as UploadedFile[]).length) {
            classes = [await utils.classify((images as UploadedFile).data)];
        }
        while ((images as UploadedFile[]).length > 0) {
            const chunk = (images as UploadedFile[]).splice(0, 10);
            const processedChunk = await Promise.all(chunk.map((image) => utils.classify(image.data)));
            classes = [...classes, ...processedChunk];
        }
        res.status(200).send(classes);
    }));

// #############################################################################

app.use((err: any, req: any, res: any, next: any) => {
    console.log(err);
    res.status(Number(err.message) || 500);
    res.send();
});

// #############################################################################

const server = createServer(app);
server.listen(8383, () => {
    console.log(`estate classifying server started at http://localhost:8383`);
});
