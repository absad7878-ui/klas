// Put this file at: apps/web/app/privacypolicy-scanner/page.tsx
// (rename it to page.tsx). Public URL: https://YOUR-DOMAIN/privacypolicy-scanner

const APP_NAME = "SnapDoc AI"; // TODO: change to your scanner app's exact Play Store name
const DEVELOPER_NAME = "Absad"; // TODO: change to your name or company name
const CONTACT_EMAIL = "mazof90@gmail.com"; // TODO: change to a real email you check
const LAST_UPDATED = "October 30, 2026";

// Set to true if the app shows ads (AdMob). Set to false if it has no ads.
const HAS_ADS = false;

// Set to false if the app does NOT send any text to an AI service.
const USES_AI_ENHANCEMENT = true;

// Names of the AI providers your app really calls (edit to match).
const AI_PROVIDERS = "Anthropic and Mistral AI";

export const metadata = {
  title: "Privacy Policy — SnapDoc AI",
  description:
    "Privacy Policy for SnapDoc AI, a document scanner app for Android with on-device scanning and optional AI text enhancement.",
};

export default function PrivacyPolicyScanner() {
  return (
    <>
      <style>{`
        .pp-page {
          --pp-ink: #1a1d23;
          --pp-muted: #5b6270;
          --pp-accent: #0f766e;
          --pp-line: #e5e7eb;
          max-width: 760px;
          margin: 0 auto;
          padding: 56px 24px 96px;
          color: var(--pp-ink);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.65;
        }
        .pp-page h1 {
          font-size: 2rem;
          margin: 0 0 8px;
          letter-spacing: -0.01em;
        }
        .pp-page .pp-meta {
          color: var(--pp-muted);
          margin: 0 0 32px;
          font-size: 0.95rem;
        }
        .pp-page h2 {
          font-size: 1.25rem;
          margin: 36px 0 8px;
          padding-top: 24px;
          border-top: 1px solid var(--pp-line);
        }
        .pp-page p, .pp-page li {
          font-size: 1rem;
        }
        .pp-page ul {
          padding-left: 22px;
        }
        .pp-page a {
          color: var(--pp-accent);
        }
        .pp-page .pp-summary {
          background: #f0fdfa;
          border: 1px solid #c7efe9;
          border-radius: 14px;
          padding: 16px 20px;
          margin: 0 0 8px;
        }
        .pp-page .pp-summary p {
          margin: 0;
        }
      `}</style>

      <main className="pp-page">
        <h1>Privacy Policy — {APP_NAME}</h1>
        <p className="pp-meta">Last updated: {LAST_UPDATED}</p>

        <div className="pp-summary">
          <p>
            <strong>In short:</strong> {APP_NAME} scans documents with your
            camera and keeps them on your device. We do not create accounts or
            collect personal information.
            {USES_AI_ENHANCEMENT
              ? " If you choose to use AI text enhancement, the text from your scan is sent to an AI provider to be improved. Nothing is sent unless you use that feature."
              : ""}
            {HAS_ADS
              ? " The app also shows ads provided by Google AdMob."
              : ""}
          </p>
        </div>

        <h2>1. About this policy</h2>
        <p>
          This Privacy Policy explains how the {APP_NAME} Android app (the
          &quot;App&quot;), published by {DEVELOPER_NAME} (&quot;we&quot;,
          &quot;us&quot;), handles information. The App lets you scan
          documents, improve the look of scans, extract text from them, and
          export them as files.
        </p>

        <h2>2. Information we collect</h2>
        <p>
          We do not collect personal information. The App has no user accounts
          and no sign-up. We do not collect your name, email address, phone
          number, or contacts, and we do not run our own servers that store
          your documents.
        </p>

        <h2>3. Your documents and scans</h2>
        <p>
          Scanning, cropping, image filters, and saving happen on your device.
          Your scans, extracted text, and exported files are stored on your
          device. We cannot see them. You can delete them at any time inside the
          App, and uninstalling the App removes the data stored in its private
          storage. Files you export to your gallery, downloads, or other apps
          are controlled by you and remain until you delete them.
        </p>

        <h2>4. Text recognition (OCR)</h2>
        <p>
          The App uses Google ML Kit text recognition to read text from your
          scans. This runs on your device, so your images are not sent to us or
          to Google for text recognition.
        </p>

        {USES_AI_ENHANCEMENT ? (
          <>
            <h2>5. Optional AI text enhancement</h2>
            <p>
              The App offers an optional feature that uses artificial
              intelligence to clean up and improve text extracted from your
              scans, for example to fix recognition mistakes. This feature runs
              only when you choose to use it.
            </p>
            <p>
              When you use it, the extracted text is sent over an encrypted
              connection to a third-party AI provider ({AI_PROVIDERS}) to
              process your request, and the improved text is sent back to the
              App. We do not store this text on our own servers. How the
              provider handles data is governed by its own privacy policy and
              terms.
            </p>
            <p>
              Please do not use this feature on documents with sensitive
              information that you do not want processed by an AI service, such
              as passwords, ID numbers, or financial or medical records.
            </p>
          </>
        ) : (
          <>
            <h2>5. Artificial intelligence</h2>
            <p>
              The App does not send your documents or text to any AI service.
              All processing happens on your device.
            </p>
          </>
        )}

        <h2>6. Permissions</h2>
        <ul>
          <li>
            <strong>Camera:</strong> used only to take pictures of documents
            you want to scan.
          </li>
          <li>
            <strong>Photos or storage:</strong> used only to import images you
            choose and to save the scans and files you export.
          </li>
          {USES_AI_ENHANCEMENT || HAS_ADS ? (
            <li>
              <strong>Internet:</strong> used only for{" "}
              {USES_AI_ENHANCEMENT ? "the optional AI text enhancement" : ""}
              {USES_AI_ENHANCEMENT && HAS_ADS ? " and " : ""}
              {HAS_ADS ? "loading ads" : ""}. Scanning works without an
              internet connection.
            </li>
          ) : null}
        </ul>
        <p>
          You can withdraw any permission at any time in your Android settings.
        </p>

        <h2>7. Information stored on your device</h2>
        <p>
          The App saves your documents and simple settings, such as your
          preferred filters and theme, in its private storage on your device.
          This information stays on your device.
        </p>

        {HAS_ADS ? (
          <>
            <h2>8. Advertising (Google AdMob)</h2>
            <p>
              The App shows ads provided by Google AdMob. To show and measure
              ads, Google and its partners may collect and use information such
              as your device advertising ID, IP address, approximate location,
              device and app information, and ad interaction data. We do not
              receive or control this data. Your scans and extracted text are
              not shared with advertisers.
            </p>
            <p>
              You can reset your advertising ID or opt out of ad
              personalization in your Android settings (Settings → Privacy →
              Ads). To learn how Google uses data from apps that use its
              services, visit{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
              >
                policies.google.com/technologies/partner-sites
              </a>
              . Where required by law, such as in the European Economic Area
              and the United Kingdom, the App asks for your consent before
              showing personalized ads.
            </p>
          </>
        ) : (
          <>
            <h2>8. Advertising and analytics</h2>
            <p>
              The App contains no advertising and no third-party analytics or
              tracking tools. If we add advertising in a future version, we
              will update this policy before that version is released.
            </p>
          </>
        )}

        <h2>9. Sharing of information</h2>
        <p>
          We do not sell, rent, or trade personal information.
          {USES_AI_ENHANCEMENT
            ? " The only data that leaves your device is the text you choose to send for AI enhancement"
            : ""}
          {USES_AI_ENHANCEMENT && HAS_ADS ? ", and the advertising data collected directly by Google AdMob" : ""}
          {USES_AI_ENHANCEMENT || HAS_ADS ? ", as described above." : " Because we do not collect your data, we have nothing to share."}
        </p>

        <h2>10. Children&apos;s privacy</h2>
        <p>
          The App is not directed at children under 13, and we do not knowingly
          collect personal information from children.
        </p>

        <h2>11. Data security</h2>
        <p>
          Your scans are stored on your device and are protected by the
          security of your Android system. We recommend using a screen lock on
          your phone. Data sent to AI services travels over an encrypted
          connection.
        </p>

        <h2>12. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The latest version is
          always available on this page, with the &quot;Last updated&quot; date
          changed at the top.
        </p>

        <h2>13. Contact us</h2>
        <p>
          If you have any questions about this Privacy Policy, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </main>
    </>
  );
}