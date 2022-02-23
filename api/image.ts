import fs from "fs";
import { VercelRequest, VercelResponse } from "@vercel/node";
import type { CanvasKit } from "canvaskit-wasm";
import path from "path";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";

let ck: CanvasKit | undefined;
const getCanvasKit = () => {
  if (!ck) {
    ck = require("canvaskit-wasm")({
      locateFile: (file: string) =>
        path.resolve(require.resolve("canvaskit-wasm"), "..", file),
    });
  }
  return ck!;
};

const fontData = fs.readFileSync(
  require.resolve('@fontsource/sarabun/files/sarabun-all-400-normal.woff')
);

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    const id = String(req.query.id || '')
    if (!id) {
      res.status(400).send("Missing id query variable");
      return;
    }
    const name = req.query.name ? String(req.query.name) : `PromptPay ID ${id}`
    const canvasKit = await getCanvasKit();
    const size = 8 * (2 * 16 + 29);
    const canvas = canvasKit.MakeCanvas(size, size);
    const amount = +req.query.amount;
    const payload = generatePayload(id, {
      amount: amount || undefined,
    });
    await new Promise<void>((resolve, reject) =>
      QRCode.toCanvas(
        canvas,
        payload,
        {
          errorCorrectionLevel: "L",
          scale: 8,
          margin: 16,
        },
        (err?: Error) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      )
    );
    canvas.loadFont(fontData, {
      family: "Sarabun",
      style: "normal",
      weight: "400",
    });
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#333";
    ctx.font = "24px Sarabun";
    const topText = String(name);
    const bottomText = amount
      ? `${amount.toFixed(2)} THB`
      : "(no amount specified)";
    const drawText = (text: string, y: number) => {
      ctx.fillText(text, (size - ctx.measureText(text).width) / 2, y);
    };
    drawText(topText, 32);
    drawText(bottomText, size - 16);
    res.setHeader("Content-Type", "image/png");
    const dataUrl = canvas.toDataURL("image/png");
    res.send(Buffer.from(dataUrl.split(",")[1], "base64"));
  } catch (error) {
    res.send("Error");
    console.error(error);
  }
}
