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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const http_1 = require("http");
const catch_1 = __importDefault(require("./tools/catch"));
const utils = __importStar(require("./tools/utils"));
const app = express_1.default();
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(express_fileupload_1.default());
// default resource
app.get("/", catch_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(200);
})));
// #############################################################################
// classify images
app.post("/classify", catch_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const images = req.files.images;
    const classes = yield Promise.all(images.map((image) => utils.classify(image.data)));
    res.status(200).send(classes);
})));
// #############################################################################
app.use((err, req, res, next) => {
    console.log(err);
    res.status(Number(err.message) || 500);
    res.send();
});
// #############################################################################
const server = http_1.createServer(app);
utils.loadModel().then(() => server.listen(8989, () => {
    console.log(`static server started at http://localhost:8989`);
}));
//# sourceMappingURL=server.js.map