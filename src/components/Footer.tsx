import { Link } from 'react-router-dom';
import { Anchor, MapPin, Phone, Mail, Clock, Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Ships', path: '/ships' },
    { name: 'Berthing', path: '/berthing' },
    { name: 'Cargo', path: '/cargo' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  const contactInfo = [
    { icon: <MapPin className="w-5 h-5" />, text: 'Port of Kribi, Littoral Region, Cameroon' },
    { icon: <Phone className="w-5 h-5" />, text: '+237 6XX XXX XXX' },
    { icon: <Mail className="w-5 h-5" />, text: 'info@kribiport.cm' },
    { icon: <Clock className="w-5 h-5" />, text: 'Open 24/7' },
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: '#' },
    { icon: <Twitter className="w-5 h-5" />, href: '#' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#' },
  ];

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-wave rounded-lg">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Kribi Port</span>
            </Link>
            <p className="text-muted-foreground">
              Connecting Cameroon to the world through excellence in port operations and maritime services.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Follow us on ${social.href.split('//')[1]}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="text-primary mt-0.5">{item.icon}</span>
                  <span className="text-muted-foreground">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest updates and news.
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Email address for newsletter subscription"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
          <p>© {currentYear} Kribi Port Authority. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
