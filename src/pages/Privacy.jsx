import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout'

export default function Privacy() {
  return (
    <InfoPageLayout title="Privacy Policy" subtitle="How Ecomify handles your information.">
      <InfoSection title="Information we collect">
        <p>We collect the details you provide to create an account and place orders — such as your name, email, phone number, and shipping address — plus basic usage data that helps us improve the store.</p>
      </InfoSection>
      <InfoSection title="How we use your information">
        <p>Your information is used to process orders, provide support, keep your account secure, and (with your consent) send updates and offers.</p>
      </InfoSection>
      <InfoSection title="Sharing">
        <p>We don’t sell your personal information. We only share what’s needed with trusted providers — like delivery and payment partners — to fulfill your orders.</p>
      </InfoSection>
      <InfoSection title="Your choices">
        <p>You can update your details in your Profile, manage notification preferences in Settings, and request account deletion at any time.</p>
      </InfoSection>
      <InfoSection title="Contact">
        <p>Questions about privacy? Reach us through the Contact page.</p>
      </InfoSection>
      <p className="text-xs text-gray-400 dark:text-slate-500">This is a sample policy for demonstration and is not legal advice.</p>
    </InfoPageLayout>
  )
}
