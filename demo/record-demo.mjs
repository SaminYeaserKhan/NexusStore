// Plays NexusStore's demo in a real browser window so you can screen-record smooth,
// repeatable takes. A visible cursor and captions are drawn onto the page as it runs.
// Setup and usage: demo/README.md
//
//   node record-demo.mjs            sign in, wait for Enter, then play the demo
//   node record-demo.mjs prepare    place a few sample orders so the admin charts have data

import { chromium } from "playwright";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const cfg = loadConfig(path.join(here, "demo.env"));
const APP = (cfg.APP_URL || "http://localhost:5173").replace(/\/$/, "");
const [WIDTH, HEIGHT] = (cfg.WINDOW || "1440x810").split("x").map(Number);
const SPEED = Number(cfg.SPEED || 1); // 2 = twice as fast, 0.5 = half speed
const CAPTIONS = cfg.CAPTIONS !== "off";
const HEADLESS = cfg.HEADLESS === "on";

function loadConfig(file) {
  if (!existsSync(file)) {
    console.error(`Missing ${file}\nCopy demo.env.example to demo.env and fill it in.`);
    process.exit(1);
  }
  const values = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (match) values[match[1]] = match[2];
  }
  return values;
}

function need(key) {
  if (!cfg[key]) {
    console.error(`Set ${key} in demo/demo.env first.`);
    process.exit(1);
  }
  return cfg[key];
}

// ---------- cursor, captions and pacing ----------

const OVERLAY = `
  addEventListener("DOMContentLoaded", () => {
    const dot = document.createElement("div");
    dot.id = "demo-cursor";
    dot.style.cssText = "position:fixed;left:-50px;top:-50px;width:22px;height:22px;margin:-11px 0 0 -11px;" +
      "border-radius:50%;background:rgba(255,255,255,.9);border:2px solid rgba(20,20,20,.7);" +
      "box-shadow:0 2px 8px rgba(0,0,0,.35);pointer-events:none;z-index:2147483647;transition:transform .12s";
    document.body.appendChild(dot);
    addEventListener("mousemove", e => { dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px"; }, true);
    addEventListener("mousedown", () => { dot.style.transform = "scale(.65)"; }, true);
    addEventListener("mouseup", () => { dot.style.transform = "scale(1)"; }, true);
  });
`;

let currentCaption = "";
let lastAlert = "";

const wait = ms => new Promise(resolve => setTimeout(resolve, ms / SPEED));

async function caption(page, text) {
  currentCaption = text;
  if (!CAPTIONS) return;
  await page.evaluate(value => {
    let bar = document.getElementById("demo-caption");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "demo-caption";
      bar.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);max-width:80vw;" +
        "padding:12px 22px;border-radius:12px;background:rgba(10,12,20,.82);color:#fff;" +
        "font:600 22px/1.35 system-ui,-apple-system,'Segoe UI',sans-serif;text-align:center;" +
        "pointer-events:none;z-index:2147483646;transition:opacity .25s";
      document.body.appendChild(bar);
    }
    bar.textContent = value;
    bar.style.opacity = value ? "1" : "0";
  }, text).catch(() => {});
}

async function go(page, route) {
  await page.goto(APP + route, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await caption(page, currentCaption);
}

async function pointAt(page, locator) {
  await locator.waitFor({ state: "visible", timeout: 15000 });
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("it isn't visible on the page");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 });
  await wait(250);
}

async function click(page, locator) {
  await pointAt(page, locator);
  await locator.click();
  await wait(500);
}

async function type(page, locator, text) {
  await click(page, locator);
  await locator.fill("");
  await page.keyboard.type(text, { delay: 55 / SPEED });
  await wait(300);
}

async function scroll(page, pixels) {
  const steps = Math.max(1, Math.round(Math.abs(pixels) / 60));
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, Math.sign(pixels) * 60);
    await wait(40);
  }
  await wait(400);
}

// Runs one part of the demo. If it fails, the browser pauses so you can do that part by
// hand, then press Resume in the Playwright Inspector to carry on.
async function step(page, name, action) {
  process.stdout.write(`  ${name} ... `);
  lastAlert = "";
  try {
    await action();
    console.log("done");
  } catch (error) {
    const reason = error.message.split("\n")[0] + (lastAlert ? ` (the app said: "${lastAlert}")` : "");
    console.log(`\n  ! Couldn't do this automatically: ${reason}`);
    if (HEADLESS) throw error;
    console.log("    Do it by hand in the browser, then press Resume (the play button) in the Playwright Inspector.\n");
    await page.pause();
  }
}

// ---------- the store's flows ----------

async function signIn(page, email, password) {
  await go(page, "/login");
  await type(page, page.getByPlaceholder("Email Address", { exact: true }), email);
  await type(page, page.getByPlaceholder("Password", { exact: true }), password);
  await click(page, page.getByRole("button", { name: "Login", exact: true }));
  await page.waitForURL(url => !url.pathname.startsWith("/login"), { timeout: 20000 })
    .catch(() => { throw new Error(`couldn't sign in as ${email}; check the account in demo.env`); });
  await wait(800);
}

async function signOut(page) {
  await click(page, page.locator("button:has(svg.lucide-log-out)").first());
  await page.waitForURL(url => url.pathname.startsWith("/login"), { timeout: 15000 });
}

async function buyProduct(page, { index, bkash }) {
  await go(page, "/shop");
  await click(page, page.locator('a[href^="/product/"]').nth(index));
  await page.waitForURL(/\/product\//);
  await wait(1200);
  const size = page.locator("button:not([disabled])").filter({ hasText: /^\s*(XS|S|M|L|XL|XXL)\b/ }).first();
  if (await size.count()) await click(page, size);
  await click(page, page.getByRole("button", { name: /add to cart/i }));
  await go(page, "/cart");
  await wait(1000);
  const phone = page.getByPlaceholder("017...", { exact: true });
  if ((await phone.count()) && !(await phone.inputValue())) await type(page, phone, need("DELIVERY_PHONE"));
  const address = page.getByPlaceholder("Enter your full address...");
  if ((await address.count()) && !(await address.inputValue())) await type(page, address, need("DELIVERY_ADDRESS"));
  if (bkash) {
    await click(page, page.getByRole("button", { name: /bkash/i }).first());
    await click(page, page.getByRole("button", { name: /pay & confirm/i }));
    // The bKash screens are simulated: these are dummy values, and no payment is made.
    await type(page, page.getByPlaceholder("e.g 017..."), "01700000000");
    await click(page, page.getByRole("button", { name: "Confirm", exact: true }));
    await type(page, page.getByPlaceholder("1 2 3 4 5 6"), "123456");
    await click(page, page.getByRole("button", { name: "Confirm", exact: true }));
    await type(page, page.getByPlaceholder("*****"), "12345");
    await click(page, page.getByRole("button", { name: "Confirm", exact: true }));
  } else {
    await click(page, page.getByRole("button", { name: /place order/i }));
  }
  await page.waitForURL(/\/success/, { timeout: 30000 });
  await wait(1500);
}

// ---------- run ----------

const mode = process.argv[2] || "demo";
const browser = await chromium.launch({
  headless: HEADLESS,
  args: [`--window-size=${WIDTH},${HEIGHT + 90}`],
});
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  recordVideo: cfg.RECORD_VIDEO === "on" ? { dir: path.join(here, "videos"), size: { width: WIDTH, height: HEIGHT } } : undefined,
});
await context.addInitScript(OVERLAY);
const page = await context.newPage();
page.on("dialog", async dialog => {
  lastAlert = dialog.message();
  await dialog.accept();
});

if (mode === "prepare") {
  const count = Number(cfg.SAMPLE_ORDERS || 4);
  console.log(`Placing ${count} sample orders as the shopper...`);
  await step(page, "Sign in as the shopper", () => signIn(page, need("SHOPPER_EMAIL"), need("SHOPPER_PASSWORD")));
  for (let i = 0; i < count; i++) {
    await step(page, `Order ${i + 1} of ${count}`, () => buyProduct(page, { index: i, bkash: false }));
  }
  console.log("Sample orders placed. Now run: node record-demo.mjs");
} else {
  const photo = path.resolve(here, need("PHOTO"));
  if (!existsSync(photo)) {
    console.error(`PHOTO not found: ${photo}`);
    process.exit(1);
  }
  console.log("Getting ready (off camera)...");
  await step(page, "Sign in as the shopper", () => signIn(page, need("SHOPPER_EMAIL"), need("SHOPPER_PASSWORD")));
  await go(page, "/");
  await caption(page, "");
  if (!HEADLESS) {
    const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
    await prompt.question("\nStart your screen recording, then press Enter here to play the demo.");
    prompt.close();
  }

  await step(page, "Home page", async () => {
    await caption(page, "NexusStore: an e-commerce web app with AI built in");
    await page.mouse.move(WIDTH / 2, HEIGHT / 2, { steps: 20 });
    await wait(2500);
    await scroll(page, 600);
    await wait(1000);
    await scroll(page, -600);
  });

  await step(page, "Shop filters", async () => {
    await caption(page, "Browse with search, price and rating filters");
    await go(page, "/shop");
    await wait(1500);
    await type(page, page.getByPlaceholder("Max", { exact: true }), cfg.MAX_PRICE || "5000");
    await wait(800);
    const sort = page.locator("select").filter({ has: page.locator('option[value="price-low"]') }).first();
    await pointAt(page, sort);
    await sort.selectOption("price-low");
    await wait(2000);
  });

  await step(page, "Visual search", async () => {
    await caption(page, "Search by photo: Gemini recognises the product's category");
    await go(page, "/");
    await pointAt(page, page.locator("svg.lucide-camera").first());
    await page.locator('input[type="file"]').first().setInputFiles(photo);
    await page.waitForURL(/category=/, { timeout: 45000 });
    await wait(3000);
  });

  await step(page, "Shopping assistant", async () => {
    await caption(page, "A shopping assistant that answers from live stock");
    await click(page, page.locator("button.fixed.bottom-6.right-6").first());
    const box = page.getByPlaceholder("Ask about products...");
    await type(page, box, cfg.CHAT_QUESTION || "Do you have any hoodies in size M?");
    await page.keyboard.press("Enter");
    await wait(9000);
  });

  await step(page, "Close the assistant", async () => {
    const panel = page.locator("div.fixed.bottom-6.right-6").filter({ has: page.getByPlaceholder("Ask about products...") });
    await click(page, panel.locator("button:has(svg.lucide-x)").first());
  });

  await step(page, "Cart and bKash checkout", async () => {
    await caption(page, "Cart and checkout (the bKash payment is simulated)");
    await buyProduct(page, { index: Number(cfg.PRODUCT_INDEX || 0), bkash: true });
  });

  await step(page, "Switch to the store admin", async () => {
    await caption(page, "Signing in as the store admin");
    await signOut(page);
    await signIn(page, need("ADMIN_EMAIL"), need("ADMIN_PASSWORD"));
    await go(page, "/admin");
    await wait(1500);
  });

  await step(page, "Sales analytics", async () => {
    await caption(page, "Admin dashboard with live sales analytics");
    await scroll(page, 700);
    await wait(1500);
    await scroll(page, 700);
    await wait(1500);
  });

  await step(page, "AI analyst", async () => {
    await caption(page, "An AI analyst answers questions about stock and sales");
    const box = page.getByPlaceholder("e.g., Which size of Nike Shoes is running low?");
    await type(page, box, cfg.ANALYST_QUESTION || "Which category earned the most revenue?");
    await page.keyboard.press("Enter");
    await wait(9000);
  });

  await step(page, "Low-stock filter", async () => {
    await caption(page, "Inventory filters, such as low stock");
    await click(page, page.getByRole("button", { name: /^products$/i }));
    await wait(1200);
    const stock = page.locator("select").filter({ has: page.locator('option[value="Low"]') }).first();
    await pointAt(page, stock);
    await stock.selectOption("Low");
    await wait(2500);
  });

  await step(page, "AI product description", async () => {
    await caption(page, "Gemini writes product descriptions");
    const title = page.locator("label", { hasText: /^Title$/ }).locator("xpath=following-sibling::input[1]").first();
    await type(page, title, cfg.PRODUCT_TITLE || "Classic Leather Sneakers");
    await click(page, page.getByRole("button", { name: /^AI$/ }).first());
    await wait(7000);
  });

  await step(page, "End card", async () => {
    await caption(page, "React 19 · Firebase · Gemini  —  github.com/SaminYeaserKhan/NexusStore");
    await page.mouse.move(WIDTH - 5, HEIGHT - 5, { steps: 20 });
    await wait(5000);
  });

  console.log("\nDemo finished. Stop your screen recording.");
}

if (!HEADLESS) {
  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  await prompt.question("Press Enter to close the browser.");
  prompt.close();
}
await context.close();
await browser.close();
if (cfg.RECORD_VIDEO === "on") console.log(`Playwright's own recording is in ${path.join(here, "videos")}`);
