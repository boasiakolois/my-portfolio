// app/layout.jsx
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'CareerNav — AI-Powered Career Development',
  description: 'Analyze your resume, identify your skills, and get a personalized career roadmap with CareerNav AI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      </head>
      <body>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 160px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
