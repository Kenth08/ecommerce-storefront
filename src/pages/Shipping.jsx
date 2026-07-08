import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout'

export default function Shipping() {
  return (
    <InfoPageLayout title="Shipping Information" subtitle="How and when your Ecomify order arrives.">
      <InfoSection title="Delivery options">
        <p><strong>Standard Delivery</strong> — Free, arrives in 3–7 business days.</p>
        <p><strong>Express Delivery</strong> — Flat fee, arrives in 1–3 business days.</p>
      </InfoSection>
      <InfoSection title="Order processing">
        <p>Orders are prepared within 1–2 business days. You’ll see the status update in My Orders as it moves from Processing to Shipped.</p>
      </InfoSection>
      <InfoSection title="Shipping coverage">
        <p>We currently deliver nationwide. Remote areas may take a little longer than the estimates above.</p>
      </InfoSection>
      <InfoSection title="Tracking your delivery">
        <p>Open any order in My Orders to follow its progress on the status timeline: Order Placed → Processing → Shipped → Delivered.</p>
      </InfoSection>
    </InfoPageLayout>
  )
}
