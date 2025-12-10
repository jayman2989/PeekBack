import { Link } from 'react-router-dom'

function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy & Data Policy</h1>
        <p className="text-lg text-gray-600">
          Your privacy is important to us. Here's what we do and don't do with your data.
        </p>
      </div>

      <div className="space-y-8">
        {/* What We Don't Collect */}
        <section className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            What We Don't Collect
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span><strong>We do NOT track your location.</strong> Your device's GPS location is never stored or transmitted to our servers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span><strong>We do NOT collect personal information.</strong> No names, emails, phone numbers, or other identifying data.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span><strong>We do NOT use cookies for tracking.</strong> No analytics, advertising, or third-party tracking.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span><strong>We do NOT sell your data.</strong> Ever. This is a free, public service.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span><strong>We do NOT store your browsing history.</strong> Your activity on this site is not logged.</span>
            </li>
          </ul>
        </section>

        {/* What We Do Collect */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            What We Do Collect (Minimal & Transparent)
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Anonymous Authentication:</strong> We use Firebase anonymous authentication to prevent spam. This creates a temporary, anonymous user ID that cannot be linked to you personally.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Device Reports:</strong> When you submit a surveillance device, we store only the location coordinates, device type, and optional description you provide. No personal information is attached.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Voting Data:</strong> If you thumbs-up or report a device as inactive, we store only your anonymous user ID to prevent duplicate votes. This cannot identify you.</span>
            </li>
          </ul>
        </section>

        {/* How It Works */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            How Anonymous Authentication Works
          </h2>
          <p className="text-gray-700 mb-4">
            When you visit PeekBack, we automatically sign you in with an anonymous account. This allows you to:
          </p>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li>• Submit device reports</li>
            <li>• Vote on device accuracy</li>
            <li>• Report devices as inactive</li>
          </ul>
          <p className="text-gray-700">
            This anonymous ID is temporary and cannot be used to identify you. It's only used to prevent spam and duplicate submissions. 
            You can optionally link it to a permanent account (email/password) if you want, but this is completely optional.
          </p>
        </section>

        {/* Data Storage */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💾</span>
            Data Storage & Security
          </h2>
          <p className="text-gray-700 mb-4">
            All data is stored in Firebase (Google Cloud Platform) with the following protections:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• All device reports are publicly visible (this is a crowdsourcing platform)</li>
            <li>• Anonymous user IDs are stored but cannot identify individuals</li>
            <li>• No personal information is ever collected or stored</li>
            <li>• Data is encrypted in transit and at rest</li>
            <li>• You can view all public data on the map - nothing is hidden</li>
          </ul>
        </section>

        {/* Your Rights */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            Your Rights
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-gray-600 mt-1">•</span>
              <span><strong>View your submissions:</strong> All device reports are public and visible on the map.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600 mt-1">•</span>
              <span><strong>Delete your submissions:</strong> You can delete any device you reported (if you're signed in with the same anonymous account).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600 mt-1">•</span>
              <span><strong>No account required:</strong> You can browse the map without any authentication.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600 mt-1">•</span>
              <span><strong>Open source data:</strong> All device locations are public and can be exported.</span>
            </li>
          </ul>
        </section>

        {/* Contact */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions?</h2>
          <p className="text-gray-700">
            If you have questions about privacy or data collection, please visit our <Link to="/about" className="text-blue-600 hover:text-blue-800 underline">About page</Link> or 
            check out the <a href="https://github.com/jayman2989/PeekBack" className="text-blue-600 hover:text-blue-800 underline">source code</a> (if available).
          </p>
        </section>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </div>
  )
}

export default Privacy

