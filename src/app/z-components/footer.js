export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid: single column on mobile, 4 columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold mb-4">ΣΟΥΒΛΑΚΙΑ</h3>
            <p className="text-gray-400">Αυθεντικά ελληνικά σουβλάκια από το 1995.</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Σύνδεσμοι</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Αρχική
                </a>
              </li>
              <li>
                <a href="#menu" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Μενού
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Σχετικά
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Επικοινωνία</h4>
            <p className="text-gray-400">Οδός Παραδείσου 123</p>
            <p className="text-gray-400">Αθήνα, Ελλάδα</p>
            <p className="text-gray-400">210 123 4567</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Ακολουθήστε μας</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Σουβλατζίδικο. Με την επιφύλαξη παντός δικαιώματος.</p>
        </div>
      </div>
    </footer>
  );
}
