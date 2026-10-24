import "server-only";

export const googleConfig = {
  spreadsheetId:
    process.env.GOOGLE_SHEET_PHI_SHIP_ID ?? "",

  sheetName:
    process.env.GOOGLE_SHEET_PHI_SHIP_TAB_NAME ?? "",

  credentials: {
    clientEmail:
      process.env.GOOGLE_CLIENT_EMAIL ?? "",

    // privateKey:
    //   process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
  },
};