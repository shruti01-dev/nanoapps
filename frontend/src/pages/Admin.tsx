import { useEffect, useState, type FormEvent } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { createProduct, getProducts, updateProduct, uploadProductFile } from '../api/products'
import { getAdminOrders, getUsers, grantAccess } from '../api/admin'
import type { AccountUser, CatalogProduct, OrderRecord } from '../api/types'
import { formatInr, priceLabel } from '../lib/format'

const field = 'border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal'

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const emptyForm = {
  name: '',
  description: '',
  type: 'web',
  price: '',
  pricingModel: 'one_time',
  billingPeriod: 'monthly',
  isFree: false,
  freeDownloadUrl: '',
  planId: '',
  isActive: true,
}

export default function Admin() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [users, setUsers] = useState<AccountUser[]>([])
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [uploadProductId, setUploadProductId] = useState<number | null>(null)
  const [platform, setPlatform] = useState('windows')
  const [version, setVersion] = useState('')
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadMode, setUploadMode] = useState<'link' | 'file' | 'folder'>('link')
  const [linkUrl, setLinkUrl] = useState('')
  const [grantEmail, setGrantEmail] = useState('')
  const [grantProductId, setGrantProductId] = useState<number | null>(null)

  const load = async () => {
    const [productRes, userRes, orderRes] = await Promise.all([
      getProducts({ all: true }),
      getUsers(),
      getAdminOrders(),
    ])
    setProducts(productRes.data)
    setUsers(userRes.data)
    setOrders(orderRes.data)
  }

  useEffect(() => {
    load().catch(() => setError('Could not load admin data.'))
  }, [])

  const payload = () => ({
    name: form.name,
    slug: slugify(form.name),
    description: form.description,
    type: form.type,
    price: form.pricingModel === 'free' ? 0 : parseFloat(form.price || '0'),
    pricing_model: form.pricingModel === 'subscription' ? 'subscription' : 'one_time',
    billing_period: form.billingPeriod,
    is_free: form.pricingModel === 'free',
    free_download_url: form.freeDownloadUrl,
    razorpay_plan_id: form.planId,
    is_active: form.isActive,
  })

  const handleSaveProduct = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (editingId) await updateProduct(editingId, payload())
      else await createProduct(payload())
      setSuccess(editingId ? 'Product updated.' : 'Product created.')
      setForm(emptyForm)
      setEditingId(null)
      await load()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save product.')
    }
  }

  const startEdit = (product: CatalogProduct) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      type: product.type,
      price: String(product.price),
      pricingModel: product.is_free ? 'free' : product.pricing_model,
      billingPeriod: product.billing_period || 'monthly',
      isFree: product.is_free,
      freeDownloadUrl: product.free_download_url || '',
      planId: product.razorpay_plan_id || '',
      isActive: product.is_active,
    })
  }

  const selectedUpload = products.find((product) => product.id === uploadProductId)

  const handleSaveLink = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!selectedUpload) {
      setError('Select a tool or software first.')
      return
    }
    try {
      await updateProduct(selectedUpload.id, {
        name: selectedUpload.name,
        slug: selectedUpload.slug,
        description: selectedUpload.description,
        type: selectedUpload.type,
        price: Number(selectedUpload.price),
        pricing_model: selectedUpload.pricing_model,
        billing_period: selectedUpload.billing_period || 'monthly',
        is_free: selectedUpload.is_free,
        free_download_url: linkUrl,
        razorpay_plan_id: selectedUpload.razorpay_plan_id || '',
        is_active: selectedUpload.is_active,
      })
      setSuccess('Link saved.')
      setLinkUrl('')
      await load()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save the link.')
    }
  }

  const handleUploadFile = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!selectedUpload || uploadFiles.length === 0) {
      setError('Select a product and a file or folder first.')
      return
    }
    try {
      const formData = new FormData()
      uploadFiles.forEach((uploadFile) => {
        formData.append('files', uploadFile, uploadFile.webkitRelativePath || uploadFile.name)
      })
      formData.append('platform', platform)
      formData.append('version', version || '1.0.0')
      await uploadProductFile(selectedUpload.id, formData)
      setSuccess('Upload saved.')
      setVersion('')
      setUploadFiles([])
      await load()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed.')
    }
  }

  const handleGrant = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!grantProductId) {
      setError('Choose a product to grant.')
      return
    }
    try {
      await grantAccess(grantEmail, grantProductId)
      setSuccess('Access granted.')
      setGrantEmail('')
      await load()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not grant access.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-line px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-2xl font-semibold text-ink">Admin</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink/60">
              Add products, upload desktop files, and grant access. Built-in web tools use the slugs
              image-compressor and data-cleaner. Subscription products need a Razorpay plan id.
            </p>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
            <div className="bracket-card bg-paper p-6">
              <h2 className="font-display text-lg font-semibold text-ink">
                {editingId ? 'Edit product' : 'Add product'}
              </h2>
              <form onSubmit={handleSaveProduct} className="mt-5 flex flex-col gap-3">
                <input className={field} placeholder="Product name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <textarea className={field} placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <select className={field} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="web">Tools</option>
                    <option value="desktop">Software</option>
                  </select>
                  <select
                    className={field}
                    value={form.pricingModel}
                    onChange={(e) => setForm({ ...form, pricingModel: e.target.value, isFree: e.target.value === 'free' })}
                  >
                    <option value="free">Free</option>
                    <option value="one_time">One-time</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>
                {form.pricingModel === 'subscription' && (
                  <div className="grid grid-cols-2 gap-3">
                    <select className={field} value={form.billingPeriod} onChange={(e) => setForm({ ...form, billingPeriod: e.target.value })}>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <input className={field} placeholder="Razorpay plan id" value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} />
                  </div>
                )}
                {form.pricingModel !== 'free' && (
                  <input className={field} type="number" min="1" step="0.01" placeholder="Price (INR)" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                )}
                {editingId && (
                  <label className="flex items-center gap-2 text-sm text-ink/80">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                    Listed on the site
                  </label>
                )}
                <div className="mt-2 flex gap-3">
                  <button type="submit" className="bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-blueprint">
                    {editingId ? 'Save changes' : 'Create product'}
                  </button>
                  {editingId && (
                    <button type="button" className="text-sm text-ink/60" onClick={() => { setEditingId(null); setForm(emptyForm) }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="flex flex-col gap-10">
              <div className="bracket-card bg-paper p-6">
                <h2 className="font-display text-lg font-semibold text-ink">Upload or add a link</h2>
                <form onSubmit={handleSaveLink} className="mt-5 flex flex-col gap-3">
                  <select className={field} value={uploadProductId ?? ''} onChange={(e) => {
                    const id = Number(e.target.value)
                    setUploadProductId(id)
                    const product = products.find((item) => item.id === id)
                    setLinkUrl(product?.free_download_url || '')
                    setUploadFiles([])
                  }}>
                    <option value="">Select tool or software</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.type === 'web' ? 'Tools' : 'Software'})
                      </option>
                    ))}
                  </select>
                  <select className={field} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    <option value="windows">Windows</option>
                    <option value="mac">Mac</option>
                  </select>
                  <select className={field} value={uploadMode} onChange={(e) => {
                    setUploadMode(e.target.value as 'link' | 'file' | 'folder')
                    setUploadFiles([])
                  }}>
                    <option value="link">Add a link</option>
                    <option value="file">Upload a file</option>
                    <option value="folder">Upload a folder</option>
                  </select>
                  {uploadMode === 'link' ? (
                    <>
                      <input
                        className={field}
                        placeholder="URL — opens this tool or software"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                      />
                      <button type="submit" className="border border-ink px-4 py-2 text-sm font-medium text-ink transition hover:border-teal hover:text-teal">
                        Save URL
                      </button>
                    </>
                  ) : (
                    <>
                      <input className={field} placeholder="Version (e.g. 1.0.0)" value={version} onChange={(e) => setVersion(e.target.value)} />
                      <input
                        key={uploadMode}
                        className="text-sm text-ink/70"
                        type="file"
                        multiple={uploadMode === 'folder'}
                        {...(uploadMode === 'folder' ? { webkitdirectory: '', directory: '' } : {})}
                        onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                      />
                      {uploadFiles.length > 0 && (
                        <p className="text-xs text-ink/50">{uploadFiles.length} selected</p>
                      )}
                      <button type="button" onClick={handleUploadFile} className="border border-ink px-4 py-2 text-sm font-medium text-ink transition hover:border-teal hover:text-teal">
                        Upload
                      </button>
                    </>
                  )}
                </form>
              </div>

              <div className="bracket-card bg-paper p-6">
                <h2 className="font-display text-lg font-semibold text-ink">Grant access</h2>
                <p className="mt-2 text-sm text-ink/60">
                  Use this when you want to unlock a product for someone without a payment. Type the email of an account that already registered, choose the product, then grant access. That person can download it on their next login.
                </p>
                <form onSubmit={handleGrant} className="mt-5 flex flex-col gap-3">
                  <input className={field} type="email" required placeholder="Customer email" value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} />
                  <select className={field} value={grantProductId ?? ''} onChange={(e) => setGrantProductId(Number(e.target.value))}>
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                  <button type="submit" className="border border-ink px-4 py-2 text-sm font-medium text-ink transition hover:border-teal hover:text-teal">
                    Grant access
                  </button>
                </form>
              </div>
            </div>
          </div>

          {error && <p className="mx-auto mt-6 max-w-6xl text-sm text-red-600">{error}</p>}
          {success && <p className="mx-auto mt-6 max-w-6xl text-sm text-teal">{success}</p>}

          <div className="mx-auto mt-12 max-w-6xl">
            <h2 className="font-display text-lg font-semibold text-ink">All products</h2>
            <div className="mt-4 overflow-x-auto border border-line">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line text-ink/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 text-ink">{product.name}</td>
                      <td className="px-4 py-3 text-ink/70">{product.type === 'web' ? 'Tools' : 'Software'}</td>
                      <td className="px-4 py-3 text-ink/70">{priceLabel(product)}</td>
                      <td className="px-4 py-3 text-ink/50">{product.is_active ? 'Listed' : 'Hidden'}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" className="text-teal" onClick={() => startEdit(product)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-6xl">
            <h2 className="font-display text-lg font-semibold text-ink">Recent orders</h2>
            <div className="mt-4 overflow-x-auto border border-line">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line text-ink/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 text-ink">{order.email}</td>
                      <td className="px-4 py-3 text-ink/70">{order.product_name}</td>
                      <td className="px-4 py-3 text-ink/70">{formatInr(order.amount)}</td>
                      <td className="px-4 py-3 text-ink/50">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-6xl">
            <h2 className="font-display text-lg font-semibold text-ink">Users</h2>
            <div className="mt-4 overflow-x-auto border border-line">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line text-ink/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => (
                    <tr key={account.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 text-ink">{account.name}</td>
                      <td className="px-4 py-3 text-ink/70">{account.email}</td>
                      <td className="px-4 py-3 text-ink/70">{account.role}</td>
                      <td className="px-4 py-3 text-ink/50">{account.is_verified ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
