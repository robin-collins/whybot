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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const puppeteer_1 = __importDefault(require("puppeteer"));
const readability_1 = require("@mozilla/readability");
const turndown_1 = __importDefault(require("turndown"));
const jsdom_1 = require("jsdom"); // JSDOM is needed for Readability
const router = (0, express_1.Router)();
const turndownService = new turndown_1.default();
// Basic URL validation (consider a more robust library for production)
const isValidUrl = (urlString) => {
    try {
        const url = new URL(urlString);
        return url.protocol === "http:" || url.protocol === "https:";
    }
    catch (_) {
        return false;
    }
};
/**
 * @function fetchWebpageHandler
 * @description Handler for the /api/fetch-webpage endpoint.
 *              Fetches, cleans, and converts webpage content to Markdown.
 */
router.get('/fetch-webpage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const targetUrl = req.query.url;
    if (!targetUrl || !isValidUrl(targetUrl)) {
        return res.status(400).json({ error: 'Invalid or missing URL' });
    }
    console.log(`Fetching webpage content for: ${targetUrl}`);
    let browser = null; // Declare browser outside try block for finally clause
    try {
        // Launch Puppeteer
        // Add '--no-sandbox' flag for running in certain environments (like Docker)
        // Consider configuring executablePath if needed
        browser = yield puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common args for compatibility
        });
        const page = yield browser.newPage();
        // Set a reasonable timeout
        yield page.setDefaultNavigationTimeout(30000); // 30 seconds
        // Navigate to the URL
        yield page.goto(targetUrl, { waitUntil: 'networkidle2' }); // Wait until network is idle
        // Get page content
        const htmlContent = yield page.content();
        // Use JSDOM to parse the HTML for Readability
        const dom = new jsdom_1.JSDOM(htmlContent, { url: targetUrl });
        // Use Readability to extract the main content
        const reader = new readability_1.Readability(dom.window.document);
        const article = reader.parse();
        if (!article || !article.content) {
            console.warn(`Readability could not extract content from ${targetUrl}`);
            // Attempt to fallback to full body HTML if article extraction fails
            const bodyHtml = yield page.evaluate(() => document.body.innerHTML);
            if (bodyHtml) {
                console.log("Falling back to turndown on full body HTML");
                const markdownContent = turndownService.turndown(bodyHtml);
                return res.json({ markdownContent: markdownContent.substring(0, 15000) }); // Limit fallback size
            }
            return res.status(500).json({ error: 'Could not extract readable content' });
        }
        // Convert the cleaned HTML to Markdown
        const markdownContent = turndownService.turndown(article.content);
        console.log(`Successfully processed ${targetUrl}, Markdown length: ${markdownContent.length}`);
        // Send the Markdown content back
        // Limit response size to prevent excessively large payloads
        res.json({ markdownContent: markdownContent.substring(0, 20000) });
    }
    catch (error) {
        console.error(`Error fetching or processing URL ${targetUrl}:`, error);
        res.status(500).json({ error: `Failed to fetch or process URL: ${error.message}` });
    }
    finally {
        // Ensure the browser is closed even if errors occur
        if (browser) {
            yield browser.close();
            console.log(`Closed browser instance for ${targetUrl}`);
        }
    }
}));
exports.default = router; // Export the router
