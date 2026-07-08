import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout'

export default function Terms() {
  return (
    <InfoPageLayout title="Terms of Service" subtitle="The basics of using Ecomify.">
      <InfoSection title="Using Ecomify">
        <p>By shopping with Ecomify you agree to use the store lawfully and to provide accurate account and order details.</p>
      </InfoSection>
      <InfoSection title="Orders & pricing">
        <p>All orders are subject to acceptance and availability. We do our best to keep prices and product details accurate, and will let you know if something changes before your order ships.</p>
      </InfoSection>
      <InfoSection title="Payments">
        <p>Cash on Delivery is available now. Online payment options shown at checkout will be enabled as they go live.</p>
      </InfoSection>
      <InfoSection title="Returns">
        <p>Returns and refunds are handled per our Returns policy.</p>
      </InfoSection>
      <InfoSection title="Accounts">
        <p>You’re responsible for keeping your account credentials secure. Let us know right away if you notice any unauthorized use.</p>
      </InfoSection>
      <p className="text-xs text-gray-400 dark:text-slate-500">This is a sample terms document for demonstration and is not legal advice.</p>
    </InfoPageLayout>
  )
}
