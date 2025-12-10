import { Link } from 'react-router-dom'

function AboutDevices() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">About These Devices</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Understanding mass surveillance technology and its impact on privacy
        </p>
      </div>

      <div className="space-y-12">
        {/* What Are These Devices */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Mass Surveillance Devices?</h2>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Mass surveillance devices are automated systems designed to monitor, track, and record 
            activities in public spaces. Unlike traditional security cameras that may be monitored 
            by humans, these systems use advanced technology to automatically collect, process, and 
            store vast amounts of data about people's movements and activities.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            These devices are increasingly being deployed in communities across the United States, 
            often with minimal public awareness or discussion about their privacy implications.
          </p>
        </section>

        {/* Types of Devices - Detailed */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Surveillance Devices</h2>
          <div className="space-y-6">
            {/* Flock Cameras */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-3xl">📷</span>
                Flock Cameras
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>What they are:</strong> Flock Safety is a company that manufactures automated 
                  license plate recognition (ALPR) cameras. These devices are typically mounted on poles, 
                  traffic lights, or buildings and automatically capture images of every vehicle that passes by.
                </p>
                <p>
                  <strong>How they work:</strong> Using computer vision and machine learning, Flock cameras 
                  scan license plates in real-time, creating a searchable database of vehicle locations. 
                  The system can identify vehicles by make, model, color, and other characteristics, not 
                  just license plates.
                </p>
                <p>
                  <strong>Data collection:</strong> Each camera captures high-resolution images of vehicles, 
                  including partial views of drivers and passengers. This data is stored in cloud databases 
                  and can be shared across law enforcement agencies, private companies, and other subscribers 
                  to the Flock network. Reports have documented that Flock's standard contracts grant the 
                  company broad rights to share police-collected data across thousands of agencies nationwide. 
                  (See Sources section for references.)
                </p>
                <p>
                  <strong>Privacy concerns:</strong> Flock cameras create permanent records of where you've 
                  been, when you were there, and who you were with. This data can be used to build detailed 
                  profiles of people's daily routines, relationships, and activities—all without your 
                  knowledge or consent.
                </p>
              </div>
            </div>

            {/* License Plate Readers */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-3xl">🚗</span>
                License Plate Readers (LPRs)
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>What they are:</strong> License plate readers are automated systems that scan and 
                  record license plate numbers from vehicles. They can be stationary (mounted on poles or 
                  buildings) or mobile (mounted on police vehicles or trailers).
                </p>
                <p>
                  <strong>How they work:</strong> LPRs use optical character recognition (OCR) technology 
                  to read license plates from images or video feeds. The plate numbers are then checked 
                  against databases of stolen vehicles, warrants, and other law enforcement records.
                </p>
                <p>
                  <strong>Data collection:</strong> Even when a vehicle isn't on any "hot list," the system 
                  still records the plate number, location, date, and time. This creates a comprehensive 
                  database of vehicle movements that can be searched and analyzed later.
                </p>
                <p>
                  <strong>Privacy concerns:</strong> LPRs track innocent people just as much as they track 
                  suspects. The data collected can reveal where you work, where you worship, who you visit, 
                  and what activities you participate in. This information can be stored indefinitely and 
                  shared with other agencies.
                </p>
              </div>
            </div>

            {/* Traffic Cameras */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-3xl">🚦</span>
                Traffic Cameras
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>What they are:</strong> While often justified for traffic enforcement (red light 
                  cameras, speed cameras), many traffic monitoring systems have capabilities that extend 
                  beyond their stated purpose.
                </p>
                <p>
                  <strong>How they work:</strong> Modern traffic cameras can capture high-resolution images 
                  and video, perform license plate recognition, and use artificial intelligence to analyze 
                  traffic patterns and vehicle behavior.
                </p>
                <p>
                  <strong>Data collection:</strong> Traffic cameras can record vehicle movements, speeds, 
                  and patterns throughout entire road networks, creating detailed maps of how people move 
                  through cities.
                </p>
                <p>
                  <strong>Privacy concerns:</strong> Traffic cameras can be used to track individuals' 
                  movements across entire metropolitan areas, revealing daily routines, social connections, 
                  and private activities. The data may be retained for extended periods and used for 
                  purposes beyond traffic enforcement.
                </p>
              </div>
            </div>

            {/* Security Cameras */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-3xl">👁️</span>
                Advanced Security Cameras
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>What they are:</strong> Public-facing security cameras that may include facial 
                  recognition, behavior analysis, or other advanced surveillance capabilities.
                </p>
                <p>
                  <strong>How they work:</strong> These systems can use AI to identify individuals, analyze 
                  behavior patterns, detect "suspicious" activities, and track people across multiple 
                  camera feeds.
                </p>
                <p>
                  <strong>Data collection:</strong> Advanced security cameras can create biometric profiles, 
                  track individuals' movements, and build databases of who goes where and when.
                </p>
                <p>
                  <strong>Privacy concerns:</strong> Facial recognition and behavior analysis systems can 
                  identify and track individuals without their knowledge, creating detailed profiles of 
                  people's activities, associations, and behaviors. Research from the National Institute 
                  of Standards and Technology (NIST) and other studies have found that these systems have 
                  significantly higher error rates for people of color, with Black and Asian individuals 
                  up to 100 times more likely to be misidentified than white men. This can lead to false 
                  identifications and wrongful arrests. (See Sources section for research references.)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Implications */}
        <section className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Privacy Implications</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">The Chilling Effect</h3>
              <p className="text-gray-700 leading-relaxed">
                Research and legal analysis from civil liberties organizations indicate that when people know 
                they're being watched, they may change their behavior. This "chilling effect" can discourage 
                people from exercising their First Amendment rights, such as attending protests, visiting 
                certain places of worship, or engaging in political activities. The ACLU and other organizations 
                have documented how mass surveillance can undermine the freedom to associate and express oneself 
                without fear of government monitoring. (See Sources section for references.)
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Location Tracking</h3>
              <p className="text-gray-700 leading-relaxed">
                Surveillance devices create detailed records of where you go and when. This location data can 
                reveal sensitive information about your life:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3 text-gray-700">
                <li>Where you work and live</li>
                <li>Places of worship you attend</li>
                <li>Medical facilities you visit</li>
                <li>Political events or protests you attend</li>
                <li>Social relationships and associations</li>
                <li>Daily routines and habits</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Retention and Sharing</h3>
              <p className="text-gray-700 leading-relaxed">
                Many surveillance systems store data indefinitely and share it across multiple agencies and 
                private companies. This means:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3 text-gray-700">
                <li>Your movements can be tracked across jurisdictions</li>
                <li>Data may be accessed by agencies you never interacted with</li>
                <li>Information can be sold or shared with private companies</li>
                <li>There's often no clear policy on data deletion</li>
                <li>You may have no way to know what data exists about you</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Function Creep</h3>
              <p className="text-gray-700 leading-relaxed">
                Surveillance systems are often justified for one purpose (like finding stolen cars) but then 
                used for broader purposes (like tracking political activists or monitoring entire communities). 
                This "function creep" means that systems deployed for limited purposes can expand to become 
                comprehensive surveillance networks.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Discriminatory Impact</h3>
              <p className="text-gray-700 leading-relaxed">
                Research studies have found that surveillance systems are often deployed disproportionately in 
                communities of color and low-income neighborhoods, even after accounting for crime rates and 
                socioeconomic factors. This can lead to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3 text-gray-700">
                <li>Increased police contact and surveillance in marginalized communities</li>
                <li>Higher rates of false positives and mistaken identifications</li>
                <li>Reinforcement of existing biases in law enforcement</li>
                <li>Erosion of trust between communities and law enforcement</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Q: If I'm not doing anything wrong, why should I care?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>A:</strong> Mass surveillance affects everyone, not just people suspected of crimes. 
                These systems create permanent records of innocent people's movements and activities. Even if 
                you're not doing anything illegal, you have a right to privacy. The data collected can be 
                misused, shared without your knowledge, or used to build profiles of your life. History shows 
                that surveillance powers granted for one purpose often expand to other uses.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Q: Don't these devices help catch criminals?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>A:</strong> While surveillance devices can sometimes help solve crimes, the evidence 
                for their effectiveness is mixed. Studies have found that the vast majority of data collected 
                is about innocent people, not criminals. For example, a 2020 audit of the Los Angeles Police 
                Department found that 99.9% of 320 million ALPR images stored were unrelated to investigations. 
                Research on license plate readers has shown limited evidence of crime reduction effects. The 
                effectiveness must be weighed against the significant privacy costs. (See Sources section for 
                research references.)
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Q: Is this legal?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>A:</strong> The legality of mass surveillance is complex and varies by jurisdiction. 
                Courts have generally held that people have a reduced expectation of privacy in public spaces, 
                but there are ongoing legal challenges to mass surveillance systems. Some cities and states 
                have passed laws restricting or banning certain types of surveillance technology. The legal 
                landscape is evolving as courts and legislatures grapple with the privacy implications of 
                new surveillance technologies.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Q: Can I opt out of being tracked?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>A:</strong> Generally, no. If you drive on public roads or walk in public spaces where 
                these devices are deployed, you cannot opt out of being recorded. The systems automatically 
                capture images and data from everyone who passes by. This is why transparency about where 
                these devices are located is so important—at least people can know when they're being monitored.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Q: Who has access to this data?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>A:</strong> This varies by system and jurisdiction. Some systems share data across 
                multiple law enforcement agencies. Private companies like Flock Safety maintain databases 
                that can be accessed by subscribers. Data may also be shared with federal agencies, other 
                states, or private entities. Often, there's no clear public record of who has access to 
                surveillance data or how it's being used.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Q: How long is data stored?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>A:</strong> Retention policies vary widely. Some systems store data for 30 days, 
                others for years, and some indefinitely. Many jurisdictions don't have clear policies on 
                data retention, and there's often no mechanism for individuals to request deletion of 
                their data. This means that images and location data about you could be stored permanently 
                in databases you don't even know exist.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Q: What can I do about this?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>A:</strong> There are several things you can do:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3 text-gray-700">
                <li><strong>Stay informed:</strong> Use platforms like PeekBack to learn where surveillance devices are located in your community</li>
                <li><strong>Contact your representatives:</strong> Ask about surveillance policies in your city, county, and state</li>
                <li><strong>Attend public meetings:</strong> Many surveillance systems are approved by city councils or police oversight boards</li>
                <li><strong>Support transparency:</strong> Advocate for public disclosure of surveillance systems and data retention policies</li>
                <li><strong>Get involved:</strong> Join or support organizations working on privacy and surveillance issues</li>
                <li><strong>Contribute data:</strong> Help map surveillance devices in your area to increase public awareness</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Legal and Rights */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Rights and the Law</h2>
          <div className="space-y-4 text-gray-700">
            <p className="text-lg leading-relaxed">
              The legal framework around mass surveillance is complex and evolving. While courts have 
              generally held that people have a reduced expectation of privacy in public spaces, there 
              are important legal protections and ongoing debates about the limits of surveillance.
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Constitutional Protections</h3>
                <p>
                  The Fourth Amendment protects against unreasonable searches and seizures. In the landmark 
                  2018 case <em>Carpenter v. United States</em>, the U.S. Supreme Court ruled that long-term 
                  location tracking can constitute a search requiring a warrant. The First Amendment protects 
                  freedom of association, which civil liberties organizations have documented can be chilled 
                  by mass surveillance. (See Sources section for case references.)
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">State and Local Laws</h3>
                <p>
                  Some states and cities have passed laws restricting or banning certain surveillance 
                  technologies. These laws may require public notice, community input, or prohibit certain 
                  uses of surveillance data.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparency Requirements</h3>
                <p>
                  Many jurisdictions have public records laws that may require disclosure of surveillance 
                  policies, data retention practices, and usage statistics. However, these requirements 
                  vary widely and are not always enforced.
                </p>
              </div>
            </div>
            <p className="text-lg mt-6 leading-relaxed">
              <strong>Important:</strong> This information is for educational purposes only and does not 
              constitute legal advice. If you have questions about your rights or the legality of specific 
              surveillance practices in your area, consult with a qualified attorney or civil liberties 
              organization.
            </p>
          </div>
        </section>

        {/* Resources */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Learn More</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              For more information about surveillance technology, privacy rights, and advocacy:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>ACLU (American Civil Liberties Union):</strong> Resources on surveillance, privacy, and civil liberties</li>
              <li>• <strong>EFF (Electronic Frontier Foundation):</strong> Information about technology, privacy, and digital rights</li>
              <li>• <strong>Local privacy advocacy groups:</strong> Many cities have organizations working on surveillance issues</li>
              <li>• <strong>Your local government:</strong> Contact city council members, police oversight boards, and public records offices</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You can also explore our <Link to="/about" className="text-blue-600 hover:text-blue-800 underline">About page</Link> to learn more 
              about PeekBack, or check out our <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</Link> to 
              understand how we protect your privacy on this platform.
            </p>
          </div>
        </section>

        {/* Sources and References */}
        <section className="bg-white border border-gray-300 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Sources and References</h2>
          <p className="text-gray-700 mb-6 text-lg">
            The information on this page is based on research, studies, and reports from civil liberties organizations, 
            academic institutions, and government audits. Below are key sources organized by topic.
          </p>

          <div className="space-y-8">
            {/* Flock Safety and ALPR Data */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Flock Safety and License Plate Reader Data</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• ACLU Connecticut. "Automatic License Plate Readers Moratorium." <a href="https://www.acluct.org/press-releases/automatic-license-plate-readers-moratorium/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">acluct.org</a></li>
                <li>• Axios. "Illinois: Flock Safety, CBP license plate data violations." August 26, 2025. <a href="https://www.axios.com/local/chicago/2025/08/26/illinois-flock-safety-cbp-license-plate-data-violations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">axios.com</a></li>
                <li>• Axios. "Boulder police stop sharing license plate data with ICE-linked network." September 16, 2025. <a href="https://www.axios.com/local/boulder/2025/09/16/boulder-police-ice-license-plate-data" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">axios.com</a></li>
                <li>• Business & Human Rights Resource Centre. "Flock Safety responds." <a href="https://www.business-humanrights.org/en/latest-news/flock-safety-responds/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">business-humanrights.org</a></li>
                <li>• Boston.com. "Cambridge hits pause on license plate cameras amid privacy concerns." October 22, 2025. <a href="https://www.boston.com/news/local-news/2025/10/22/cambridge-hits-pause-on-license-plate-cameras-amid-privacy-concerns/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">boston.com</a></li>
              </ul>
            </div>

            {/* Data Retention and Privacy */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Retention and Privacy Concerns</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• California State Auditor. "Los Angeles Police Department: Millions of Images From License Plate Readers Are Compromising Individual Privacy." Report 2019-118, 2020. <a href="https://information.auditor.ca.gov/pdfs/reports/2019-118.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">information.auditor.ca.gov</a></li>
                <li>• ACLU. "License Plate Readers Just Don't Keep Data on Innocent People." <a href="https://www.aclu.org/news/national-security/license-plate-readers-just-dont-keep-data-innocent" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">aclu.org</a></li>
                <li>• California Bureau of Automotive Repair. "ALPR Privacy and Usage Policy." <a href="https://www.bar.ca.gov/ALPR" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">bar.ca.gov</a></li>
                <li>• Axios. "Federal access to Washington police plate data sharing, Seattle." October 29, 2025. <a href="https://www.axios.com/local/seattle/2025/10/29/federal-access-washington-police-plate-data-sharing-seattle" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">axios.com</a></li>
              </ul>
            </div>

            {/* Chilling Effect and First Amendment */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Chilling Effect and First Amendment Rights</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Yale Law School. "ACLU v. NSA: How Greater Transparency Can Reduce Chilling Effects of Mass Surveillance." <a href="https://law.yale.edu/mfia/case-disclosed/aclu-v-nsa-how-greater-transparency-can-reduce-chilling-effects-mass-surveillance" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">law.yale.edu</a></li>
                <li>• NYCLU. "Federal Court Decision in NYCLU and ACLU Suit Strikes Down National Security Letter Provision." <a href="https://www.nyclu.org/press-release/federal-court-decision-nyclu-and-aclu-suit-strikes-down-national-security-letter" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">nyclu.org</a></li>
                <li>• NYCLU. "ACLU and NYCLU File Lawsuit Challenging Constitutionality of NSA Phone Spying Program." <a href="https://www.nyclu.org/press-release/aclu-nyclu-file-lawsuit-challenging-constitutionality-nsa-phone-spying-program" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">nyclu.org</a></li>
                <li>• Brennan Center for Justice. "Statement: Civil Rights Concerns About Monitoring Social Media by Law Enforcement." <a href="https://www.brennancenter.org/our-work/research-reports/statement-civil-rights-concerns-about-monitoring-social-media-law" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">brennancenter.org</a></li>
                <li>• NYCLU. "NYC Free Speech Threat Assessment." <a href="https://www.nyclu.org/report/nyc-free-speech-threat-assessment" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">nyclu.org</a></li>
              </ul>
            </div>

            {/* Effectiveness Studies */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Effectiveness of License Plate Readers</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Office of Justice Programs. "License Plate Reader (LPR) Police Patrols in Crime Hot Spots." <a href="https://www.ojp.gov/ncjrs/virtual-library/abstracts/license-plate-reader-lpr-police-patrols-crime-hot-spots" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">ojp.gov</a></li>
                <li>• Center for Evidence-Based Crime Policy. "License Plate Readers and Roadblocks at High-Crime Intersections." <a href="https://cebcp.org/evidence-based-policing/the-matrix/micro-places/micro-places-wheeler-and-phillips-2018/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">cebcp.org</a></li>
                <li>• National League of Cities. "City Residents Call for License Plate Reader Technology to Improve Public Safety Objectively." November 15, 2023. <a href="https://www.nlc.org/article/2023/11/15/city-residents-call-for-license-plate-reader-technology-to-improve-public-safety-objectively/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">nlc.org</a></li>
              </ul>
            </div>

            {/* Facial Recognition Bias */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Facial Recognition Technology and Bias</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• AIAAIC Repository. "Study: Facial Recognition Software Misidentifies Dark-Skinned Women." <a href="https://www.aiaaic.org/aiaaic-repository/ai-algorithmic-and-automation-incidents/study-facial-recognition-software-misidentifies-dark-skinned-women" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">aiaaic.org</a></li>
                <li>• The Washington Post. "Federal study confirms racial bias of many facial-recognition systems, casts doubt on their expanding use." December 19, 2019. <a href="https://www.washingtonpost.com/technology/2019/12/19/federal-study-confirms-racial-bias-many-facial-recognition-systems-casts-doubt-their-expanding-use/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">washingtonpost.com</a></li>
                <li>• Associated Press. "Facial recognition technology jailed a man for days. His lawsuit joins others from Black plaintiffs." September 24, 2025. <a href="https://apnews.com/article/b613161c56472459df683f54320d08a7" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">apnews.com</a></li>
                <li>• Axios. "IBM is exiting the face recognition business." June 8, 2020. <a href="https://www.axios.com/2020/06/08/ibm-is-exiting-the-face-recognition-business" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">axios.com</a></li>
              </ul>
            </div>

            {/* Fourth Amendment and Legal Protections */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fourth Amendment and Legal Protections</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• ACLU. "Carpenter v. United States." <a href="https://www.aclu.org/cases/carpenter-v-united-states" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">aclu.org</a></li>
                <li>• U.S. Supreme Court. <em>Carpenter v. United States</em>, 585 U.S. ___ (2018).</li>
              </ul>
            </div>

            {/* Function Creep */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Function Creep and Mission Creep</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Wikipedia. "Stingray phone tracker." <a href="https://en.wikipedia.org/wiki/Stingray_phone_tracker" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">en.wikipedia.org</a></li>
                <li>• Brennan Center for Justice. "When Police Surveillance Meets the Internet of Things." <a href="https://www.brennancenter.org/our-work/research-reports/when-police-surveillance-meets-internet-things" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">brennancenter.org</a></li>
                <li>• Wikipedia. "Use of unmanned aerial vehicles in law enforcement." <a href="https://en.wikipedia.org/wiki/Use_of_unmanned_aerial_vehicles_in_law_enforcement" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">en.wikipedia.org</a></li>
                <li>• ACLU of Washington. "Mission Creep: The Patriot Act and the War on Drugs." <a href="https://aclu-wa.org/blog/mission-creep-patriot-act-and-war-drugs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">aclu-wa.org</a></li>
              </ul>
            </div>

            {/* Discriminatory Deployment */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Discriminatory Deployment Patterns</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Stanford University Department of Sociology. "Surveillance cameras are clustered in racially diverse U.S. neighborhoods." <a href="https://sociology.stanford.edu/surveillance-cameras-are-clustered-racially-diverse-us-neighborhoods" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">sociology.stanford.edu</a></li>
                <li>• ACLU of the District of Columbia. "Community Oversight of Surveillance - D.C." <a href="https://www.acludc.org/en/community-oversight-surveillance-dc" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">acludc.org</a></li>
                <li>• The Guardian. "Oakland surveillance cameras: freeways and highways." March 29, 2024. <a href="https://www.theguardian.com/world/2024/mar/29/oakland-surveillance-cameras-freeways-highways" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">theguardian.com</a></li>
                <li>• ACLU. "Community Control Over Police Surveillance." <a href="https://www.aclu.org/community-control-over-police-surveillance" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">aclu.org</a></li>
                <li>• Business & Human Rights Resource Centre. "Unbridled surveillance of U.S. public housing residents raises human rights concerns." <a href="https://www.business-humanrights.org/en/latest-news/unbridled-surveillance-of-us-public-housing-residents-raises-human-rights-concerns/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">business-humanrights.org</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-300">
            <p className="text-sm text-gray-600 italic">
              <strong>Note:</strong> This page is regularly updated as new research and information becomes available. 
              Sources are provided for transparency and to allow readers to verify claims and explore topics in greater depth. 
              If you notice outdated information or have additional credible sources to suggest, please contact us.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Involved</h2>
          <p className="text-gray-700 text-lg mb-6">
            Help increase transparency about surveillance in your community:
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
              Report a Device
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutDevices
