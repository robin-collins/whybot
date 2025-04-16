import { Router, Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { JSDOM } from 'jsdom'; // JSDOM is needed for Readability

const router = Router();
const turndownService = new TurndownService();

// Basic URL validation (consider a more robust library for production)
const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

/**
 * @function fetchWebpageHandler
 * @description Handler for the /api/fetch-webpage endpoint.
 *              Fetches, cleans, and converts webpage content to Markdown.
 */
router.get('/fetch-webpage', async (req: Request, res: Response) => {
    const targetUrl = req.query.url as string;

    if (!targetUrl || !isValidUrl(targetUrl)) {
        return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    console.log(`Fetching webpage content for: ${targetUrl}`);
    let browser = null; // Declare browser outside try block for finally clause

    try {
        // Launch Puppeteer
        // Add '--no-sandbox' flag for running in certain environments (like Docker)
        // Consider configuring executablePath if needed
        browser = await puppeteer.launch({
            headless: true, // Run in headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common args for compatibility
        });
        const page = await browser.newPage();

        // Set a reasonable timeout
        await page.setDefaultNavigationTimeout(30000); // 30 seconds

        // Navigate to the URL
        await page.goto(targetUrl, { waitUntil: 'networkidle2' }); // Wait until network is idle

        // Get page content
        const htmlContent = await page.content();

        // Use JSDOM to parse the HTML for Readability
        const dom = new JSDOM(htmlContent, { url: targetUrl });

        // Use Readability to extract the main content
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article || !article.content) {
            console.warn(`Readability could not extract content from ${targetUrl}`);
            // Attempt to fallback to full body HTML if article extraction fails
            const bodyHtml = await page.evaluate(() => document.body.innerHTML);
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

    } catch (error: any) {
        console.error(`Error fetching or processing URL ${targetUrl}:`, error);
        res.status(500).json({ error: `Failed to fetch or process URL: ${error.message}` });
    } finally {
        // Ensure the browser is closed even if errors occur
        if (browser) {
            await browser.close();
            console.log(`Closed browser instance for ${targetUrl}`);
        }
    }
});

export default router; // Export the router