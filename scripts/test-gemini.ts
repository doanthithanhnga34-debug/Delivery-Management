import { analyzeTicketWithAI } from "../src/features/ai/services/ticketAnalysis.service";

const testCases = [
  {
    name: "H-12",
    content: `
GIAO SAU 15H 48/4 mê linh phường 19 bình thạnh 0763344550- Mẫn Ngô -7 Mì jjolmyeon IK-Food 1kg - 455 -1 Nước dùng mì lạnh Chungwoo 2.1kg (Chai) - 225 ship 40 thu khách 720`,
  },

  {
    name: "H13",
    content: `
157/2 Nguyễn Gia Trí, P.Thạnh Mỹ Tây 0938026294 1 Sốt trộn cơm bibimbap Maru 150g - 26 ship 40 thu khách 66`,
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
      const result = await analyzeTicketWithAI(testCase.content);

      console.dir(result.analysis, { depth: null });

      console.log("Model:", result.model);
      console.log("Input tokens:", result.inputTokens);
      console.log("Output tokens:", result.outputTokens);
      console.log("Total tokens:", result.totalTokens);

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
