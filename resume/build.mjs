// Builds resume.pdf from resume.html with headless Chrome.
// usage: node build.mjs <out.pdf> [chrome path]
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const [out, chrome = "/usr/bin/google-chrome"] = process.argv.slice(2);
const source = process.env.RESUME_HTML ?? fileURLToPath(new URL("./resume.html", import.meta.url));
const browser = await puppeteer.launch({ executablePath: chrome, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.goto(`file://${source.startsWith("/") ? "" : "/"}${source.replace(/\\/g, "/")}`, { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log("wrote", out);
