export const metadata = {
  title: "Privacy Policy — [DocScanner AI]",
  description: "Privacy Policy for [DocScanner AI], a document scanner app.",
};

export default function PrivacyPolicyDocScanner() {
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
          font-size: 1.9rem;
          margin-bottom: 4px;
        }
        .pp-page .pp-updated {
          color: var(--pp-muted);
          font-size: 0.95rem;
          margin-bottom: 40px;
        }
        .pp-page h2 {
          font-size: 1.25rem;
          margin-top: 40px;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--pp-line);
          padding-bottom: 8px;
        }
        .pp-page h3 {
          font-size: 1.05rem;
          margin-top: 24px;
          margin-bottom: 8px;
        }
        .pp-page p,
        .pp-page li {
          color: #2b2f38;
        }
        .pp-page ul {
          padding-left: 22px;
        }
        .pp-page li {
          margin-bottom: 6px;
        }
        .pp-page a {
          color: var(--pp-accent);
          text-decoration: none;
        }
        .pp-page a:hover {
          text-decoration: underline;
        }
        .pp-page .pp-callout {
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          border-radius: 8px;
          padding: 14px 18px;
          font-size: 0.95rem;
          margin: 20px 0;
        }
        .pp-page .pp-placeholder {
          background: #fff7ed;
          border: 1px dashed #fb923c;
          padding: 1px 6px;
          border-radius: 4px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.9em;
        }
        .pp-page table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 0.95rem;
        }
        .pp-page th,
        .pp-page td {
          text-align: left;
          padding: 10px 12px;
          border: 1px solid var(--pp-line);
          vertical-align: top;
        }
        .pp-page th {
          background: #f9fafb;
        }
        .pp-page footer {
          margin-top: 56px;
          padding-top: 20px;
          border-top: 1px solid var(--pp-line);
          color: var(--pp-muted);
          font-size: 0.9rem;
        }
      `}</style>

      <div className="pp-page">
        <h1>Privacy Policy</h1>
        <p className="pp-updated">
          Effective date: <span className="pp-placeholder">[july 11, 2026]</span> · Last
          updated: <span className="pp-placeholder">[july 11, 2026]</span>
        </p>

        <p>
          This Privacy Policy explains how <span className="pp-placeholder">[DocScanner AI]</span> (
          &quot;the App&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), developed by{" "}
          <span className="pp-placeholder">[Abubakar Ishaq]</span>, handles information
          when you use the App. It is written to be accurate about what the App actually does, in
          plain language.
        </p>

        <div className="pp-callout">
          <strong>Short version:</strong> Scanning, filtering, and OCR (text recognition) happen
          on your device. Your documents are stored locally on your device by default and are not
          uploaded to our servers. The only feature that sends any content off your device is the
          optional <em>&quot;Enhance with AI&quot;</em> tool, and only when you choose to use it on
          a specific page.
        </div>

        <h2>1. Information We Collect</h2>

        <h3>1.1 Content you scan</h3>
        <p>
          The App uses your device&apos;s camera to capture photos of documents. Cropping,
          rotation, filters (e.g. black &amp; white, grayscale, brightness/contrast), and text
          recognition (OCR) are all performed <strong>on your device</strong>, using on-device
          processing. This content is not sent to us or to any third party as part of these steps.
        </p>

        <h3>1.2 Documents you save</h3>
        <p>
          Scanned pages, edited documents, and generated PDFs are stored in the App&apos;s local
          storage on your device. We do not have access to these files, and they are not
          automatically backed up to any server we operate. (If your device has OS-level cloud
          backup enabled — such as iCloud or Google&apos;s device backup — your device&apos;s
          operating system may include the App&apos;s local data in that backup; that is governed
          by your device platform&apos;s own policies, not by us.)
        </p>

        <h3>1.3 Optional &quot;Enhance with AI&quot; feature</h3>
        <p>
          If you choose to use the optional AI-enhancement tool on a page, the image and/or
          extracted text for <strong>that specific page</strong> is sent to a third-party AI
          service for processing, and the result is returned to the App. This only happens when
          you actively tap this feature — it is not used automatically or in the background.
        </p>
        <table>
          <tbody>
            <tr>
              <th>What&apos;s sent</th>
              <td>The page image and/or its recognized text, at the time you request the enhancement.</td>
            </tr>
            <tr>
              <th>Who processes it</th>
              <td>A third-party AI service provider engaged by us solely to perform this processing on our behalf.</td>
            </tr>
            <tr>
              <th>Why</th>
              <td>To generate an improved/cleaned-up version of the page&apos;s text or image.</td>
            </tr>
            <tr>
              <th>Retention</th>
              <td>The submitted content is used only to generate the result and is not retained by us beyond that purpose.</td>
            </tr>
          </tbody>
        </table>
        <p>
          If you&apos;d prefer not to share any content off-device, simply don&apos;t use the
          &quot;Enhance with AI&quot; button — every other feature (scanning, filters, OCR, PDF
          export, sharing) works fully offline.
        </p>

        <h3>1.4 Information we do not collect</h3>
        <ul>
          <li>
            We do not require you to create an account, and we do not collect your name, email
            address, or other contact details through the App itself.
          </li>
          <li>
            We do not access your device&apos;s photo library except when you explicitly choose to
            import an image, if that feature is enabled.
          </li>
          <li>We do not track your precise location.</li>
          <li>We do not use the App to serve advertising, and we do not sell your data.</li>
        </ul>
        <p style={{ fontSize: "0.9rem", color: "var(--pp-muted)" }}>
          <span className="pp-placeholder">
           
          </span>
        </p>

        <h2>2. Permissions the App Requests</h2>
        <table>
          <tbody>
            <tr>
              <th>Permission</th>
              <th>Why we need it</th>
            </tr>
            <tr>
              <td>Camera</td>
              <td>To scan documents.</td>
            </tr>
            <tr>
              <td>Photos / Storage</td>
              <td>
                To save scanned documents and exported files (PDF, JPG, PNG, TXT) to your device,
                and to let you share or import images.
              </td>
            </tr>
            <tr>
              <td>Internet</td>
              <td>Only used when you actively choose the optional &quot;Enhance with AI&quot; feature (see §1.3).</td>
            </tr>
          </tbody>
        </table>

        <h2>3. How We Use Information</h2>
        <p>To the limited extent described above, any information involved is used only to:</p>
        <ul>
          <li>Provide the App&apos;s core scanning, editing, OCR, and export features;</li>
          <li>Process a specific page through the optional AI-enhancement feature, if and when you request it;</li>
          <li>
            Diagnose and fix technical problems{" "}
            <span className="pp-placeholder">[if applicable]</span>.
          </li>
        </ul>

        <h2>4. Sharing Your Information</h2>
        <p>We do not sell your information. We share content only in these cases:</p>
        <ul>
          <li>
            <strong>Third-party AI provider</strong> — only the specific page you submit through
            &quot;Enhance with AI&quot; (§1.3), and only at the moment you use it.
          </li>
          <li>
            <strong>Your own actions</strong> — when you use the App&apos;s &quot;Export /
            Share&quot; feature, you choose where your document goes (e.g. email, messaging apps,
            cloud storage) via your device&apos;s native share sheet. That&apos;s your choice, not
            something we do on your behalf.
          </li>
          <li>
            <strong>Legal requirements</strong> — if required to do so by law or valid legal
            process.
          </li>
        </ul>

        <h2>5. Data Retention &amp; Deletion</h2>
        <p>
          Scanned documents remain on your device until you delete them within the App or
          uninstall the App. Uninstalling the App removes its local data from your device (subject
          to your device&apos;s own backup settings). You can delete individual documents or pages
          at any time from within the App.
        </p>

        <h2>6. Children&apos;s Privacy</h2>
        <p>
          The App is not directed at children under 13 (or the relevant minimum age in your
          region), and we do not knowingly collect personal information from children.
        </p>

        <h2>7. Security</h2>
        <p>
          We take reasonable measures to protect information handled by the App. However, no
          method of electronic storage or transmission is 100% secure, and we cannot guarantee
          absolute security.
        </p>

        <h2>8. Your Choices</h2>
        <ul>
          <li>You can avoid all off-device data sharing by not using the &quot;Enhance with AI&quot; feature.</li>
          <li>
            You can revoke Camera or Photos permissions at any time in your device&apos;s system
            settings (this will limit the relevant features).
          </li>
          <li>You can delete documents individually, or uninstall the App to remove its local data.</li>
        </ul>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated &quot;Last updated&quot; date. Significant changes may be announced
          within the App.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, contact us at:
          <br />
          <a href="mailto:[Absadcompany@gmail.com]">[email protected]</a>
          <br />
          <span className="pp-placeholder">[]</span>
        </p>

     
      </div>
    </>
  );
}