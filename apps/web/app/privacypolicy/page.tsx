export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', fontFamily: 'sans-serif', lineHeight: 1.7 }}>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated: June 2026</strong></p>

      <h2>1. What We Collect</h2>
      <p>We collect an anonymous device ID generated on first launch, used only to track usage counts and subscription status. We do not collect your name, email, or any personal information.</p>

      <h2>2. How Your Text Is Handled</h2>
      <p>Text is processed securely to generate responses and is not used to identify users or train external models.</p>

      <h2>3. Usage Data</h2>
      <p>We store daily request counts per anonymous device ID to enforce free-tier limits. This data contains no personally identifiable information.</p>

      <h2>4. Subscriptions</h2>
      <p>Subscription purchases are handled entirely by Google Play. We receive only a purchase token to verify your subscription status. We do not handle or store payment details.</p>

      <h2>5. Ads</h2>
      <p>Free users see rewarded ads served by Google AdMob. AdMob may collect device identifiers and usage data in accordance with Google's Privacy Policy.</p>

      <h2>6. Third-Party Services</h2>
      <p>We use an AI language model to process text. No identifying information is sent alongside your text. We do not sell your data to any third party.</p>

      <h2>7. Data Retention</h2>
      <p>We retain anonymous usage data only as long as necessary to provide app functionality. Data is automatically deleted after it is no longer needed.</p>

      <h2>8. Security</h2>
      <p>We use industry-standard security measures to protect data during transmission and processing.</p>

      <h2>9. Your Rights</h2>
      <p>Since we do not link data to your identity, there is nothing to delete or export. Uninstalling the app removes all locally stored data.</p>

      <h2>10. Contact</h2>
      <p>Privacy questions? Email us at <a href="mailto:fluentkey.support@gmail.com">fluentkey.support@gmail.com</a></p>
    </div>
  );
}