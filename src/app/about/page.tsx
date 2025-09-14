"use client";

import { useState } from 'react';
import Head from 'next/head';
import Navbar from '../navigator';
import Footer from '../footer';
import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Σχετικά | Σουβλατζίδικο</title>
        <meta name="description" content="Η ιστορία και η φιλοσοφία του σουβλατζίδικου μας" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <Navbar />

      {/* About Header */}
      <section className="bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Η Ιστορία Μας</h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">
            Από το 1985, δημιουργούμε αυθεντικά ελληνικά σουβλάκια με πάθος και αγάπη για την παραδοσιακή γεύση
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-bold transition-all ${activeTab === 'history' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Ιστορία
            </button>
            <button 
              onClick={() => setActiveTab('philosophy')}
              className={`px-6 py-3 font-bold transition-all ${activeTab === 'philosophy' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Φιλοσοφία
            </button>
            <button 
              onClick={() => setActiveTab('team')}
              className={`px-6 py-3 font-bold transition-all ${activeTab === 'team' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Ομάδα
            </button>
            <button 
              onClick={() => setActiveTab('values')}
              className={`px-6 py-3 font-bold transition-all ${activeTab === 'values' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Αξίες
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'history' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Η Ιστορία Μας</h2>
                <p className="text-gray-600 mb-4">
                  Ξεκινήσαμε το 1985 ως μια μικρή οικογενειακή επιχείρηση στη καρδιά της Αθήνας. Ο παππούς Νίκος, 
                  με την αγάπη του για την παραδοσιακή ελληνική κουζίνα, δημιούργησε τις πρώτες συνταγές που παραμένουν 
                  αμετάβλητες μέχρι σήμερα.
                </p>
                <p className="text-gray-600 mb-4">
                  Από τότε, έχουμε εξελιχθεί αλλά πάντα διατηρώντας την αυθεντικότητα και την ποιότητα που μας 
                  διακρίνει. Σήμερα, η δεύτερη και τρίτη γενιά συνεχίζουν την παράδοση με το ίδιο πάθος.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                  <p className="text-gray-700 italic">Η συνταγή του σουβλακιού παραμένει η ίδια για 40 χρόνια. Αυτό είναι το μυστικό μας.</p>
                </div>
              </div>
              
              <div className="bg-gray-200 h-96 flex items-center justify-center">
                <div className="relative h-full w-full">
                <Image 
                  src="/oldphoto.jpg" 
                  alt="Ιστορική Φωτογραφία" 
                  fill
                  className="object-cover rounded" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'philosophy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-200 h-96 flex items-center justify-center">
                <span className="text-gray-600">Φωτογραφία Κουζίνας</span>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Η Φιλοσοφία Μας</h2>
                <p className="text-gray-600 mb-4">
              Πιστεύουμε ότι το καλό φαγητό φτιάχνεται με αγάπη, φρέσκα υλικά και σεβασμό στην παράδοση. 
                  Η φιλοσοφία μας βασίζεται σε τρεις βασικές αρχές:
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="bg-yellow-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3">1</span>
                    <span className="text-gray-600">Χρήση φρεσκών, τοπικών προϊόντων καθημερινά</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-yellow-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3">2</span>
                    <span className="text-gray-600">Σεβασμός στις παραδοσιακές τεχνικές και συνταγές</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-yellow-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3">3</span>
                    <span className="text-gray-600">Δημιουργία μιας γνησίας ελληνικής γαστρονομικής εμπειρίας</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Η Ομάδα Μας</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center bg-white border border-gray-200 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-48 w-48 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-600">Φώτο Νίκου</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Νίκος Παπadόπουλος</h3>
                  <p className="text-yellow-600 font-semibold mb-3">Ιδρυτής & Executive Chef</p>
                  <p className="text-gray-600">
                    40 χρόνια εμπειρίας στην παραδοσιακή ελληνική κουζίνα. Δημιουργός όλων των συνταγών.
                  </p>
                </div>
                
                <div className="text-center bg-white border border-gray-200 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-48 w-48 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-600">Φώτο Μαρίας</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Μαρία Παπadοπούλου</h3>
                  <p className="text-yellow-600 font-semibold mb-3">Διευθύνων Σύμβουλος</p>
                  <p className="text-gray-600">
                    Η θυγατέρα του Νίκου, συνεχίζει την παράδοση με νέες ιδέες και σύγχρονες μεθόδους.
                  </p>
                </div>
                
                <div className="text-center bg-white border border-gray-200 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-48 w-48 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-600">Φώτο Δημήτρη</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Δημήτρης Κωνσταντίνου</h3>
                  <p className="text-yellow-600 font-semibold mb-3">Head Chef</p>
                  <p className="text-gray-600">
                    Σεφ με 15 χρόνια εμπειρίας, ειδικευμένος στη διαχείριση της ποιότητας και των γεύσεων.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'values' && (
            <div>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Οι Αξίες Μας</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-16 w-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">🌿</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Φρεσκάδα</h3>
                  <p className="text-gray-600">
                    Χρησιμοποιούμε αποκλειστικά φρέσκα υλικά από τοπικούς παραγωγούς. 
                    Κάθε μέρα επιλέγουμε τα καλύτερα προϊόντα για τις δημιουργίες μας.
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-16 w-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">👨‍👩‍👧‍👦</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Οικογένεια</h3>
                  <p className="text-gray-600">
                    Είμαστε μια οικογένεια που εξυπηρετεί οικογένειες. Δημιουργούμε ένα 
                    ζεστό και φιλικό περιβάλλον για όλους τους πελάτες μας.
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-16 w-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">🏛️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Παράδοση</h3>
                  <p className="text-gray-600">
                    Σεβόμαστε και διατηρούμε τις παραδοσιακές τεχνικές και συνταγές. 
                    Η γνήσια γεύση είναι η προτεραιότητά μας.
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-16 w-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">❤️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Πάθος</h3>
                  <p className="text-gray-600">
                    Κάθε σουβλάκι φτιάχνεται με αγάπη και πάθος. Η εμπειρία του πελάτη 
                    είναι στο κέντρο όλων όσων κάνουμε.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ελάτε να Γνωρίσετε την Γεύση Μας</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Απολαύστε τα αυθεντικά ελληνικά σουβλάκια που φτιάχνονται με την ίδια αγάπη και πάθος εδώ και 40 χρόνια
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-3 font-bold text-lg transition-colors">
              Δείτε το Μενού
            </Link>
            <Link href="/contact" className="bg-transparent hover:bg-white border-2 border-white text-white hover:text-gray-900 px-8 py-3 font-bold text-lg transition-colors">
              Κάντε Κράτηση
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}