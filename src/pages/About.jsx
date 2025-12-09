import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">About PeekBack</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A free, public crowdsourcing platform dedicated to transparency and accountability 
          in mass surveillance infrastructure.
        </p>
      </div>

      <div className="space-y-12">
        {/* Mission */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            PeekBack exists to make mass surveillance visible. We believe that when surveillance 
            infrastructure is deployed in public spaces, the public has a right to know about it. 
            By crowdsourcing the locations of surveillance devices, we create transparency and 
            empower communities to make informed decisions about their privacy.
          </p>
        </section>

        {/* The Problem */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why This Matters</h2>
          <div className="space-y-4 text-gray-700">
            <p className="text-lg">
              Mass surveillance devices are being deployed in communities across the country 
              with little public awareness or oversight. These systems can:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Track your movements and create detailed location histories</li>
              <li>Collect data on millions of people without their knowledge</li>
              <li>Be used for purposes beyond their stated intent</li>
              <li>Create permanent records of your daily activities</li>
              <li>Operate with minimal transparency or accountability</li>
            </ul>
            <p className="text-lg mt-4">
              <strong>Knowledge is power.</strong> By mapping these devices, we help people 
              understand what surveillance infrastructure exists in their communities and make 
              informed choices about their privacy.
            </p>
          </div>
        </section>

        {/* Types of Devices */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Surveillance Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">📷</span>
                Flock Cameras
              </h3>
              <p className="text-gray-700">
                Automated license plate recognition (ALPR) cameras that capture and store 
                images of every vehicle that passes by. These systems create permanent records 
                of vehicle movements and are often shared across law enforcement agencies 
                and private companies.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🚗</span>
                License Plate Readers
              </h3>
              <p className="text-gray-700">
                Similar to Flock cameras, these devices scan and record license plates, 
                creating databases of vehicle locations. They can be mounted on poles, 
                vehicles, or mobile units.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🚦</span>
                Traffic Cameras
              </h3>
              <p className="text-gray-700">
                While often justified for traffic enforcement, these cameras can also be 
                used for broader surveillance purposes, tracking vehicle movements and 
                creating location histories.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">👁️</span>
                Security Cameras
              </h3>
              <p className="text-gray-700">
                Public-facing security cameras that may include facial recognition, 
                behavior analysis, or other advanced surveillance capabilities. These 
                systems can track individuals across public spaces.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How PeekBack Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Crowdsourced Reporting</h3>
                <p className="text-gray-700">
                  Community members report surveillance devices they've spotted in their neighborhoods. 
                  Each report includes the device location, type, and optional details.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Public Mapping</h3>
                <p className="text-gray-700">
                  All reported devices are displayed on an interactive map that anyone can view. 
                  The data is completely public and transparent—no hidden information.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Verification</h3>
                <p className="text-gray-700">
                  Users can confirm device accuracy with thumbs-up votes or report devices 
                  that are no longer present. This helps maintain data quality over time.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Empowerment Through Knowledge</h3>
                <p className="text-gray-700">
                  With this information, communities can engage in informed discussions about 
                  surveillance, advocate for transparency, and make privacy-conscious decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & Values */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
              <p className="text-gray-700">
                We don't track your location, collect personal data, or use tracking cookies. 
                Your privacy matters.
              </p>
            </div>

            <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Open & Transparent</h3>
              <p className="text-gray-700">
                All data is public and accessible. We believe transparency should apply to 
                surveillance infrastructure too.
              </p>
            </div>

            <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-700">
                Built by the community, for the community. This platform belongs to everyone 
                who contributes.
              </p>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Involved</h2>
          <p className="text-gray-700 text-lg mb-6">
            Help build the database and increase transparency in your community:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/map"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              Explore the Map
            </Link>
            <Link
              to="/submit"
              className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
            >
              Submit a Device
            </Link>
          </div>
        </section>

        {/* Legal & Disclaimer */}
        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Notes</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Legal Disclaimer:</strong> PeekBack is a public information resource. 
              We map devices that are visible in public spaces. This platform is for informational 
              purposes only and does not constitute legal advice.
            </p>
            <p>
              <strong>Accuracy:</strong> All data is crowdsourced and user-verified. While we 
              encourage accuracy, we cannot guarantee the completeness or correctness of all 
              information. Users can help maintain data quality by voting and reporting updates.
            </p>
            <p>
              <strong>Purpose:</strong> This platform exists to promote transparency and public 
              awareness. We do not encourage or facilitate any illegal activities. Respect private 
              property and local laws when observing surveillance infrastructure.
            </p>
          </div>
        </section>

        {/* Contact/Resources */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Learn More</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              For more information about privacy and data collection, see our{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                Privacy Policy
              </Link>
              .
            </p>
            <p>
              Questions about mass surveillance? Research organizations like the ACLU, EFF, and 
              local privacy advocacy groups provide excellent resources on surveillance technology 
              and privacy rights.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About

