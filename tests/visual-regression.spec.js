import { toMatchImageSnapshot } from "jest-image-snapshot";
import puppeteer from "puppeteer";

expect.extend({ toMatchImageSnapshot });

const browserConfig = {
  ignoreHTTPSErrors: true,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
};

describe("screenshot", () => {
  let browser;

  beforeAll(async () => {
    browser = await puppeteer.launch(browserConfig);
  });

  it("dummy application page", async () => {
    const page = await browser.newPage();

    await page.goto("http://localhost:3000");
    await page.setViewport({ width: 1024, height: 768 });
    const image = await page.screenshot({
      fullPage: true,
      path: "./tests/snapshots/image.png",
      type: "png"
    });
    expect(image).toMatchImageSnapshot({
      failureThreshold: "0.00001",
      failureThresholdType: "percent",
      noColor: true
    });
  }, 15000);

  afterAll(async () => {
    await browser.close();
  });
});
