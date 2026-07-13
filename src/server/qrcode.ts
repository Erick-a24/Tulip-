import QRCode from "qrcode";

export async function generateCheckInQrCode(checkInCode: string): Promise<string> {
  return QRCode.toDataURL(checkInCode, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 240,
  });
}
