// Put this file at: apps/web/app/privacypolicy-pixcompress/page.tsx
// (rename it to page.tsx). Public URL: https://YOUR-DOMAIN/privacypolicy-pixcompress

const APP_NAME = "PixCompress – Image Compressor";
const DEVELOPER_NAME = "Absad"; // TODO: change to your name or company name
const CONTACT_EMAIL = "mazof90@gmail.com"; // TODO: change to a real email you check
const LAST_UPDATED = "October 30, 2026";

// Set to true if the app shows ads (AdMob). Set to false if it has no ads.
const HAS_ADS = true;

export const metadata = {
  title: "Privacy Policy — PixCompress",
  description:
    "Privacy Policy for PixCompress – Image Compressor, an Android app that compresses images on your device.",
};

export default function PrivacyPolicyPixCompress() {
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
        <h1>Privacy Policy — PixCompress</h1>
        <p className="pp-meta">Last updated: {LAST_UPDATED}</p>

        <div className="pp-summary">
          <p>
            <strong>In short:</strong> PixCompress compresses your images on
            your own device. Your photos are never uploaded to our servers, and
            we do not create accounts or collect personal information.
            {HAS_ADS
              ? " The app shows ads provided by Google AdMob, which may collect certain device data as explained below."
              : ""}
          </p>
        </div>

        <h2>1. About this policy</h2>
        <p>
          This Privacy Policy explains how the {APP_NAME} Android app (the
          &quot;App&quot;), published by {DEVELOPER_NAME} (&quot;we&quot;,
          &quot;us&quot;), handles information. The App lets you reduce the
          file size of your images.
        </p>

        <h2>2. Information we collect</h2>
        <p>
          We do not collect personal information. The App has no user accounts
          and no sign-up. We do not collect your name, email address, phone
          number, or contacts, and we do not run our own servers that receive
          your data.
        </p>

        <h2>3. Your images</h2>
        <p>
          The App only accesses images that you choose to compress. All
          compression happens on your device. Your original and compressed
          images are not uploaded, shared, or sent to us or to anyone else by
          the App. Compressed images are saved to your device storage or
          gallery, where you can open, share, or delete them like any other
          file.
        </p>

        <h2>4. Permissions</h2>
        <p>
          The App may ask for permission to read the images you select and to
          save compressed images to your device. These permissions are used
          only for compressing and saving images, and you can withdraw them at
          any time in your Android settings.
        </p>

        <h2>5. Information stored on your device</h2>
        <p>
          The App may save simple settings, such as your preferred quality or
          theme, in its private storage on your device. This information never
          leaves your device and is deleted when you uninstall the App.
        </p>

        {HAS_ADS ? (
          <>
            <h2>6. Advertising (Google AdMob)</h2>
            <p>
              The App shows ads provided by Google AdMob. To show and measure
              ads, Google and its partners may collect and use information such
              as your device advertising ID, IP address, approximate location,
              device and app information, and ad interaction data. We do not
              receive or control this data.
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

            <h2>7. Internet access</h2>
            <p>
              Compression works without an internet connection. The App uses
              the internet only to load ads.
            </p>
          </>
        ) : (
          <>
            <h2>6. Advertising and third parties</h2>
            <p>
              The App contains no advertising and no third-party analytics or
              tracking tools. If we add advertising in a future version, we
              will update this policy before that version is released.
            </p>

            <h2>7. Internet access</h2>
            <p>
              The App works fully offline and does not need an internet
              connection.
            </p>
          </>
        )}

        <h2>8. Sharing of information</h2>
        <p>
          We do not sell, rent, or trade personal information.
          {HAS_ADS
            ? " The only data sharing is the advertising data collected directly by Google AdMob, as described above."
            : " Because we do not collect your data, we have nothing to share."}
        </p>

        <h2>9. Children&apos;s privacy</h2>
        <p>
          The App is not directed at children under 13, and we do not knowingly
          collect personal information from children.
        </p>

        <h2>10. Data security</h2>
        <p>
          Your images are processed on your device and are protected by the
          security of your Android system. We do not store them on any server.
        </p>

        <h2>11. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The latest version is
          always available on this page, with the &quot;Last updated&quot; date
          changed at the top.
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