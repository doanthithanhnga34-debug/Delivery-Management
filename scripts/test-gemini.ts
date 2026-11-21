import { analyzeTicketWithAI } from "../src/server/modules/ai/services/ticketAnalysis.service";

const testCases = [
  //   {
  //     name: "H-12",
  //     content: `
  // 115-117 Nguyễn Trãi, P Bến Thành, Tp HCM (nhà hàng thịt nướng Anrakutei) 6 Xốt phô mai Ottogi 1kg -600 ship 20 thu khách 620  SDT: 097 8614603 (Hoài Nam) ----- MST: 0314136636      Tên cty: CÔNG TY TNHH ANRAKUTEI VIỆT NAM      Địa chỉ: 59 Mạc Đĩnh Chi, phường Tân Định, Thành phố Hồ Chí Minh, Việt Nam      Mail: nguyen-thi-anh-ngoc@anrakutei.vn Khi xuất VAT em để tên người mua hàng là : ANRAKUTEI NGUYỄN TRÃI  `,
  //   },
  //   {
  //     name: "H13",
  //     content: `
  // GIAO TRƯỚC 12H Nghia-0704844639 Trường Đài Bắc Lô S3 Tân Phú, Quận 7 2 Sốt ướp thịt bò BBQ Beksul 10kg -1180 10kg bánh gạo chuyên lẩu 500g -490 40 Chả Cá Hàn Quốc 450g- Gói xanh- 1.400 thu khách 3.070 ship- 40  -------------- CÔNG TY TNHH MTV CUNG CẤP SUẤT ĂN CÔNG NGHIỆP THẬP TOÀN Địa chỉ: Thửa đất số 5729, tờ bản đồ số 33, khu phố 3A, P. Thới Hòa, Tp. Hồ Chí Minh mst 3702097492 thaptoan1234@gmail.comcGIAO TRƯỚC 12H Nghia-0704844639 Trường Đài Bắc Lô S3 Tân Phú, Quận 7 2 Sốt ướp thịt bò BBQ Beksul 10kg -1180 10kg bánh gạo chuyên lẩu 500g -490 40 Chả Cá Hàn Quốc 450g- Gói xanh- 1.400 thu khách 3.070 ship- 40  -------------- CÔNG TY TNHH MTV CUNG CẤP SUẤT ĂN CÔNG NGHIỆP THẬP TOÀN Địa chỉ: Thửa đất số 5729, tờ bản đồ số 33, khu phố 3A, P. Thới Hòa, Tp. Hồ Chí Minh mst 3702097492 thaptoan1234@gmail.com`,
  //   },
  //   {
  //     name:'h14',
  //     content:`31/32/28 ung Văn khiêm p Thạnh Mỹ Tây Bình Thạnh 0385543966 5kg bg thỏi - 240 Ship 40 thu khách 280`
  //   },
  //   {
  //     name:'h15',
  //     content:'187 Điện Biên Phủ, P Đa Kao, Quận 1 0942922904 (Thoang)  2 Nước sốt gà vị ngọt Chungwoo 10kg -1.380 ck 1.380.000 ship 30   Công ty TNHH OVEN MARU  mã số thuế: 0314137100  187 Điện Biên Phủ, Phường Tân Định, Thành Phố  Hồ Chí Minh, Việt Nam mail: Ovenmaruchickenvietnam@gmail.com'
  //   },
  //   {
  //     name:'h16',
  //     content:'ĐI LƯƠNG HTL+LDC ship 50'
  //   },
  //   {
  //     name:'h-17',
  //     content:'GIAO 14H Giao về 74 Lý Tế xuyên P. Linh Đông, Thủ Đức Nga: 0903063514 | -40kg bg thỏi - 1.920 -20kg bgpm2 - 1.800 thu khách 3.720 ship 50'
  //   },{
  //     name:'h-18',
  //     content:'GIAO ĐÚNG ĐỊA CHỈ Dotori order 28 thảo điền  Sdt: 0392175373 - 6 chai Nước cốt gà Chungwoo 1kg - 1.350 - 2 Nước sốt gà chiên vị ngọt Chungwoo 2.1kg - 296  - 4b Tương cà Ottogi 3kg - 620 - 3b Sốt Mayonnaise Ottogi 3kg - 810 Thu khách 3.076 ship 50  ---------------- CÔNG TY TNHH PIG MAKERS 0317850609 Địa chỉ: 07 Đường số 6, Khu phố 1, Phường An Khánh, Thành phố Hồ Chí Minh, Việt Nam Mail : dotoridining@gmail.com'
  //   },
  {
    name: "h-19",
    content: `GIAO SỚM QUẤN 2 THÙNG THÀNH 1 KIỆN Anh TÝ-Cây Xăng Tân Tân-Trà Vinh ■ 0934460368 - 0939022604 -20 Sốt tteokbokki túi trong 1kg - 760 -3kg bg thỏi -144 -2kg Bgpm1 - 200 -5 Chả cá hq King Omuk 450g - (Gói)-205 -1 Chả cá Hàn Quốc xiên sẵn Heyn 1kg (20 xiên)- 105 ck 1,414.000 ship 20   xe Thanh Nguyên 438an dương vương phường4 quận5  0913640482`,
  },
];

async function main() {
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n${testCase.name}`);

    try {
      const startedAt = performance.now();
      const result = await analyzeTicketWithAI(testCase.content);
      const durationMs = performance.now() - startedAt;
      console.dir(result.analysis, { depth: null });

      console.log("Model:", result.model);
      console.log("Input tokens:", result.inputTokens);
      console.log("Output tokens:", result.outputTokens);
      console.log("Total tokens:", result.totalTokens);

      console.log("[GEMINI_PERFORMANCE]", {
        durationMs: Math.round(durationMs),
        durationSeconds: Number((durationMs / 1000).toFixed(2)),
        model: result.model,
        totalTokens: result.totalTokens,
      });

      totalInputTokens += result.inputTokens;
      totalOutputTokens += result.outputTokens;
      totalTokens += result.totalTokens;
    } catch (error) {
      failed += 1;
      console.error("[GEMINI_TEST_ERROR]", error);
    }
  }

  console.log("\nSUMMARY");
  console.log("Input tokens:", totalInputTokens);
  console.log("Output tokens:", totalOutputTokens);
  console.log("Total tokens:", totalTokens);
  console.log("Failed:", failed);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[GEMINI_TEST_FATAL]", error);
  process.exitCode = 1;
});
