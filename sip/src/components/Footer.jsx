import React from 'react';

const MailIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3 7 12 13 21 7" />
  </svg>
);

const Footer = () => {
  const contacts = [
    {
      role: 'Principal',
      people: [
        { name: 'Dr. L. Ashok Kumar', email: 'principal@tce.edu' },
      ],
    },
    {
      role: 'Overall Coordinator',
      people: [
        { name: 'Dean Student Affairs - Dr. G. Balaji', email: 'gbarch@tce.edu' },
      ],
    },
    {
      role: 'Other Coordinators',
      people: [
        {
          name: 'Dr. A.J. Sunija',
          email: 'ajschem@tce.edu',
        },
        {
          name: 'Dr. S. Subash',
          email: 'ssheng@tce.edu',
        },
        {
          name: 'Dr. K. Saravana Kumar',
          email: 'kskmat@tce.edu',
        },
        {
          name: 'Dr. Vijayanarayanan',
          email: 'vvnphy@tce.edu',
        },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 font-sans">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1: Helpdesk Title (Visually Elevated) */}
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-md border border-indigo-500">
            <h2 className="text-2xl font-bold text-indigo-300 tracking-tight">
              Helpdesk & Support
            </h2>
            <p className="mt-4 text-gray-300 max-w-lg">
              Our team is available to assist you with any inquiries. Please feel free to reach out to us via email.
            </p>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Help Desk – Escalation Procedure</h3>
      <img
        src="/images/helpdesk-escalation.png" // 👈 Place your image here in public/images folder
        alt="Help Desk Escalation Table"
        className="w-full max-w-4xl border border-gray-300 rounded shadow"
      />
          </div>

          {/* Column 2: Contact Links */}
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wider">Contact Us</h3>
            <ul className="mt-4 space-y-6">
              {contacts.map((section, index) => (
                <li key={index}>
                  <p className="text-indigo-400 font-semibold mb-1">{section.role}</p>
                  {section.people.map((person, idx) => (
                    <div key={idx} className="flex items-start mb-2">
                      {person.email ? (
                        <MailIcon className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-base font-medium text-white">{person.name}</p>
                        {person.title && (
                          <p className="text-xs text-gray-400">{person.title}</p>
                        )}
                        {person.email && (
                          <a
                            href={`mailto:${person.email}`}
                            className="text-base text-indigo-300 hover:text-indigo-200 hover:underline transition-colors duration-300 block"
                          >
                            {person.email}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Developed By */}
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wider">Developed By</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-base text-indigo-300 font-medium">Dharshini R</li>
              <li className="text-base text-indigo-300 font-medium">Ridhyadharshinni T</li>
              <li className="text-base text-indigo-300 font-medium">Logesh K</li>
              <li className="text-base text-indigo-300 font-medium">Ranjith</li>
              <li className="text-base text-indigo-300 font-medium">Gopinath</li>
              <li className="text-base text-indigo-300 font-medium">Muruga Chandru</li>
              <li className="text-base text-indigo-300">
                <span className="font-semibold text-white">Department of Information Technology</span>
              </li>
              <li className="pt-4 text-sm text-gray-400">
                With guidance from{' '}
                <span className="text-white font-medium">Dr. C. Deisy</span>, Head of Department, and{' '}
                <span className="text-white font-medium">C.V. Nisha Angeline</span>, Assistant Professor
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Thiagarajar College of Engineering. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;