import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout'

export default function Returns() {
  return (
    <InfoPageLayout title="Returns & Refunds" subtitle="Not quite right? Here’s how returns work.">
      <InfoSection title="7-day return window">
        <p>Most items can be returned within 7 days of delivery, as long as they’re unused, in original condition, and in their original packaging.</p>
      </InfoSection>
      <InfoSection title="How to start a return">
        <p>1. Go to My Orders and open the order.</p>
        <p>2. Contact us through the Contact page with your order number and reason.</p>
        <p>3. We’ll share return instructions and, once received, process your refund.</p>
      </InfoSection>
      <InfoSection title="Refunds">
        <p>Approved refunds are issued to your original payment method. Cash on Delivery orders are refunded via your preferred method, confirmed during the return.</p>
      </InfoSection>
      <InfoSection title="Non-returnable items">
        <p>For hygiene and safety, some items (like personal care and perishables) can’t be returned once opened.</p>
      </InfoSection>
    </InfoPageLayout>
  )
}
