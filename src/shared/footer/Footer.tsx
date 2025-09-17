import React from 'react';

// Define the structure for dropdown items
interface DropdownItem {
    text: string;
    href: string;
}

// Define the structure for main navigation links
interface NavLink {
    text: string;
    href?: string;
    dropdown?: DropdownItem[];
}

// Define props for the SocialIcon component
interface SocialIconProps {
    children: React.ReactNode;
    href: string;
}

const Footer: React.FC = () => {
    // Navigation links data, consistent with the Navbar
    const navLinks: NavLink[] = [
        { text: 'Home', href: '#home' },
        { text: 'Indian', href: '#indian', dropdown: [{ text: 'Indian Thali', href: '#indian-thali' }, { text: 'South Indian', href: '#south-indian' }] },
        { text: 'Italian', href: '#italian', dropdown: [{ text: 'Pizza', href: '#pizza' }, { text: 'Pasta', href: '#pasta' }] },
        { text: 'Thai', href: '#thai', dropdown: [{ text: 'Thai Curry', href: '#thai-curry' }, { text: 'Thai Soup', href: '#thai-soup' }] },
        { text: 'Chinese', href: '#chinese' },
        { text: 'Shop', href: '#shop' },
        { text: 'Pages', href: '#pages', dropdown: [{ text: 'About Us', href: '#about' }, { text: 'FAQ', href: '#faq' }] },
    ];

    // Social Icon helper component with updated styles
    const SocialIcon: React.FC<SocialIconProps> = ({ children, href }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#7c848a] hover:text-[#EF451C] transition-colors duration-300">
            {children}
        </a>
    );

    return (
        <footer className="bg-[#1a1a1a] text-[#7c848a]">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    
                    {/* Column 1: About & Social */}
                    <div className="space-y-4">
                        <a href="/" className="inline-block">
                           <img src="/yummy-go-logo.png" alt="YummyGo Logo" className="h-16 w-auto" />
                        </a>
                        <p className="text-[16px]">
                            Discover a world of delicious food, crafted with passion and delivered right to your door.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <SocialIcon href="https://facebook.com">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                            </SocialIcon>
                            <SocialIcon href="https://twitter.com">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                            </SocialIcon>
                            <SocialIcon href="https://instagram.com">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.147 2 12.315 2zm0 1.623c-2.403 0-2.73.01-3.693.056-.945.045-1.505.207-1.858.344-.467.182-.86.383-1.244.767-.383.383-.585.777-.767 1.244-.137.353-.3.913-.344 1.858-.046.963-.056 1.29-.056 3.693s.01 2.73.056 3.693c.045.945.207 1.505.344 1.858.182.467.383.86.767 1.244.383.383.777.585 1.244.767.353.137.913.3 1.858.344.963.046 1.29.056 3.693.056s2.73-.01 3.693-.056c.945-.045 1.505-.207 1.858-.344.467-.182.86-.383 1.244-.767.383-.383.585-.777.767-1.244.137-.353.3-.913.344-1.858.046-.963.056-1.29.056-3.693s-.01-2.73-.056-3.693c-.045-.945-.207-1.505-.344-1.858-.182-.467-.383-.86-.767-1.244-.383-.383-.777-.585-1.244-.767-.353-.137-.913-.3-1.858-.344-.963-.046-1.29-.056-3.693-.056z" clipRule="evenodd" /><path d="M12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.623a3.512 3.512 0 100 7.024 3.512 3.512 0 000-7.024z" /><path d="M16.862 6.225a1.225 1.225 0 11-2.45 0 1.225 1.225 0 012.45 0z" /></svg>
                            </SocialIcon>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-[20px] font-semibold text-white tracking-wider">Quick Links</h3>
                        <ul className="mt-4 space-y-2 text-[16px]">
                            {navLinks.filter(link => !link.dropdown).map(link => (
                                <li key={link.text}><a href={link.href} className="hover:text-[#EF451C] transition-colors duration-300">{link.text}</a></li>
                            ))}
                             <li><a href="#about" className="hover:text-[#EF451C] transition-colors duration-300">About Us</a></li>
                             <li><a href="#faq" className="hover:text-[#EF451C] transition-colors duration-300">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Cuisines */}
                     <div>
                        <h3 className="text-[20px] font-semibold text-white tracking-wider">Cuisines</h3>
                        <ul className="mt-4 space-y-2 text-[16px]">
                           {navLinks.filter(link => link.dropdown).map(link => (
                                <li key={link.text}><a href={link.href || '#'} className="hover:text-[#EF451C] transition-colors duration-300">{link.text}</a></li>
                           ))}
                        </ul>
                    </div>

                    {/* Column 4: Contact Us */}
                    <div>
                        <h3 className="text-[20px] font-semibold text-white tracking-wider">Contact Us</h3>
                        <ul className="mt-4 space-y-2 text-[16px]">
                            <li>No: 58 A, East Madison Street, Baltimore, MD, USA 4508</li>
                            <li>+1 0000 - 123456789</li>
                            <li>mail@example.com</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-[#3636361a] text-center text-[16px]">
                    <p>&copy; {new Date().getFullYear()} YummyGo. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
