import { Link } from 'react-router-dom'
import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout'

const FAQS = [
  { q: 'How do I place an order?', a: 'Add items to your cart, open your cart, select the items you want, then tap “Proceed to checkout” and complete the checkout form.' },
  { q: 'What payment methods can I use?', a: 'Cash on Delivery is available now. GCash, card, and PayPal are shown as options and will be enabled once online payments go live.' },
  { q: 'How can I track my order?', a: 'Go to My Orders and open any order to see its status timeline: Order Placed → Processing → Shipped → Delivered.' },
  { q: 'Can I cancel or change my order?', a: 'Reach out through our Contact page as soon as possible and we’ll help if the order hasn’t shipped yet.' },
  { q: 'How do returns work?', a: 'See our Returns page for the full policy — most items can be returned within 7 days of delivery.' },
]

export default function Help() {
  return (
    <InfoPageLayout title="Help Center" subtitle="Answers to the questions shoppers ask most.">
      {FAQS.map((item) => (
        <InfoSection key={item.q} title={item.q}>
          <p>{item.a}</p>
        </InfoSection>
      ))}
      <InfoSection title="Still need help?">
        <p>
          Can’t find what you’re looking for? Visit our{' '}
          <Link to="/contact" className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">Contact page</Link>{' '}
          and our team will get back to you.
        </p>
      </InfoSection>
    </InfoPageLayout>
  )
}
