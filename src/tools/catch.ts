import { Request, Response } from "express";
export default function autoCatch(input: (req: Request, res: Response) => Promise<void>):
    (req: Request, res: Response) => Promise<void> {
    return async (req: Request, res: Response) => {
        try {
            await input(req, res);
        } catch (e) {
            console.log(e);
            res.sendStatus(500);
        }
    };
}
