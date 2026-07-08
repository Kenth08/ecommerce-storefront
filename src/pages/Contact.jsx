import { useState } from 'react'
import toast from 'react-hot-toast'
import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = 'Please enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Please enter a valid email.'
    if (!form.message.trim()) next.message = 'Please enter a message.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    // TODO(backend): POST the message to a real contact/support endpoint.
    toast.success('Thanks! We’ll get back to you soon.')
    setForm({ name: '', email: '', message: '' })
  }

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
      errors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-500/60'
        : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100 dark:border-slate-700'
    }`

  return (
    <InfoPageLayout title="Contact Us" subtitle="Questions, feedback, or help with an order? Send us a message.">
      <div className="grid gap-6 sm:grid-cols-3">
        <InfoSection title="Email">
          <p>support@ecomify.example</p>
        </InfoSection>
        <InfoSection title="Phone">
          <p>+63 900 000 0000</p>
        </InfoSection>
        <InfoSection title="Hours">
          <p>Mon–Sat, 9am–6pm</p>
        </InfoSection>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">Send a message</h2>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
              <input className={inputClass('name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input type="email" className={inputClass('email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
            <textarea rows={5} className={inputClass('message')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            {errors.message && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.message}</p>}
          </div>
          <button type="submit" className="w-fit rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
            Send message
          </button>
        </form>
      </section>
    </InfoPageLayout>
  )
}
