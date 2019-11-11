import bodyParser from "body-parser";
import express from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import { createServer } from "http";
import autoCatch from "./tools/catch";
import * as utils from "./tools/utils";

const app: express.Application = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

// default resource
app.get("/", autoCatch(async (req, res) => {
    res.sendStatus(200);
}));

// #############################################################################

// classify images
app.post("/classify",
    autoCatch(async (req, res) => {
        const images: UploadedFile[] = req.files.images as UploadedFile[];
        const classes = await Promise.all(images.map((image) => utils.classify(image.data)));
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
utils.loadModel().then(
    () => server.listen(8989, () => {
        console.log(`static server started at http://localhost:8989`);
    }));
