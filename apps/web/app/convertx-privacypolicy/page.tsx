// Put this file at: apps/web/app/privacypolicy-convertx/page.tsx
// Public URL will be: https://YOUR-DOMAIN/privacypolicy-convertx

const APP_NAME = "ConvertX";
const DEVELOPER_NAME = "Absad"; // TODO: change to your name or company name
const CONTACT_EMAIL = "absadish001@gmail.com"; // TODO: change to a real email you check
const LAST_UPDATED = "October 29, 2026";

export const metadata = {
  title: "Privacy Policy — ConvertX",
  description:
    "Privacy Policy for ConvertX, an offline unit converter app for Android that does not collect or share personal data.",
};

export default function PrivacyPolicyConvertX() {
  return (
    <>
      <style>{`
        .pp-page {
          --pp-ink: #1a1d23;
          --pp-muted: #5b6270;
          --pp-accent: #1e6bff;
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
          background: #f3f7ff;
          border: 1px solid #d6e4ff;
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
            <strong>In short:</strong> {APP_NAME} works completely offline. It
            does not collect, send, or share any personal data. Your history,
            favorites, and settings stay on your device only.
          </p>
        </div>

        <h2>1. About this policy</h2>
        <p>
          This Privacy Policy explains how the {APP_NAME} Android app (the
          &quot;App&quot;), published by {DEVELOPER_NAME} (&quot;we&quot;,
          &quot;us&quot;), handles information. {APP_NAME} is a unit converter
          that converts length, weight and mass, temperature, speed, and data
          size.
        </p>

        <h2>2. Information we collect</h2>
        <p>
          We do not collect any personal information. The App has no user
          accounts, no sign-up, and no servers that receive your data. We do
          not collect your name, email address, location, contacts, photos,
          device identifiers, or usage analytics.
        </p>

        <h2>3. Information stored on your device</h2>
        <p>
          To work properly, the App saves the following only in the private
          storage of your device:
        </p>
        <ul>
          <li>Your recent conversions (history).</li>
          <li>Your favorite conversions.</li>
          <li>
            Your settings, such as theme (light, dark, or system), decimal
            places, vibration, copy confirmation, and tips.
          </li>
        </ul>
        <p>
          This information never leaves your device. You can remove your
          history at any time from the History screen or from Settings, and you
          can remove favorites from the Favorites screen. Uninstalling the App
          deletes all of this data.
        </p>

        <h2>4. Internet access and permissions</h2>
        <p>
          The App does not need an internet connection and does not request
          internet access or any special permissions. It does not use your
          camera, microphone, location, contacts, or files.
        </p>

        <h2>5. Clipboard</h2>
        <p>
          When you tap the copy button, the App places the converted result on
          your device clipboard so you can paste it elsewhere. The App does not
          read what is on your clipboard.
        </p>

        <h2>6. Advertising and third parties</h2>
        <p>
          The current version of the App contains no advertising and no
          third-party analytics or tracking tools. If we add advertising in a
          future version, we will update this policy before that version is
          released and describe what data the advertising provider may collect.
        </p>

        <h2>7. Sharing of information</h2>
        <p>
          Because we do not collect your data, we do not sell, rent, trade, or
          share it with anyone.
        </p>

        <h2>8. Children&apos;s privacy</h2>
        <p>
          The App does not knowingly collect personal information from anyone,
          including children under 13. It is safe for all ages because no
          personal data is gathered.
        </p>

        <h2>9. Data security</h2>
        <p>
          Your saved history, favorites, and settings are kept in the App
          private storage on your device and are protected by the security of
          your Android system. Because nothing is transmitted, there is no data
          in transit to intercept.
        </p>

        <h2>10. Accuracy of conversions</h2>
        <p>
          We work to make conversions accurate, but results are provided for
          general information. Please double-check important calculations,
          especially for medical, engineering, or financial use.
        </p>

        <h2>11. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The latest version will
          always be available on this page, with the &quot;Last updated&quot;
          date changed at the top.
        </p>

        <h2>12. Contact us</h2>
        <p>
          If you have any questions about this Privacy Policy, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </main>
    </>
  );
}