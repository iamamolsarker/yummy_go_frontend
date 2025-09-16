import React, { useState, useEffect } from 'react';

//======================================================================
// Navbar Component
//======================================================================
const Navbar = () => {
    // State for mobile menu toggle
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // State for profile dropdown toggle
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    // State to track scroll position for transparent effect
    const [isScrolled, setIsScrolled] = useState(false);
    // State to manage which main dropdown is open
    const [openDropdown, setOpenDropdown] = useState(null);

    // Effect to handle scroll event
    useEffect(() => {
        const handleScroll = () => {
            // Change navbar background if scrolled more than 50px
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // SVG Icons
    const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
    const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
    const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    const ChevronDownIcon = () => <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;

    // Navigation links data structure including dropdowns
    const navLinks = [
        { text: 'Home', href: '#' },
        { text: 'Indian', dropdown: [{ text: 'Indian Thali', href: '#' }, { text: 'South Indian', href: '#' }] },
        { text: 'Italian', dropdown: [{ text: 'Pizza', href: '#' }, { text: 'Pasta', href: '#' }] },
        { text: 'Thai', dropdown: [{ text: 'Thai Curry', href: '#' }, { text: 'Thai Soup', href: '#' }] },
        { text: 'Chinese', href: '#' },
        { text: 'Shop', href: '#' },
        { text: 'Pages', dropdown: [{ text: 'About Us', href: '#' }, { text: 'FAQ', href: '#' }, { text: '404 Page', href: '#' }] },
        { text: 'Dashboard', href: '#' },
    ];
    
    return(
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    
                    {/* Stylish Logo */}
                    <div className="flex-shrink-0">
                        <a href="/" className="text-3xl font-bold tracking-wider flex items-center">
                            <span className={`transition-colors duration-300 ${isScrolled ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600' : 'text-white'}`}>Yummy</span>
                            <span className="text-yellow-500">Go</span>
                        </a>
                    </div>

                    {/* Desktop Navigation Links with Dropdowns */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map(link => (
                            <div 
                                key={link.text} 
                                className="relative"
                                onMouseEnter={() => link.dropdown && setOpenDropdown(link.text)}
                                onMouseLeave={() => link.dropdown && setOpenDropdown(null)}
                            >
                                <a href={link.href || '#'} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-gray-200 hover:text-yellow-400'}`}>
                                    {link.text}
                                    {link.dropdown && <ChevronDownIcon />}
                                </a>
                                {link.dropdown && openDropdown === link.text && (
                                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                                        {link.dropdown.map(item => (
                                            <a key={item.text} href={item.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 hover:text-orange-600">{item.text}</a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Desktop Icons & Profile Dropdown */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button className={`p-2 rounded-full transition-colors duration-300 ${isScrolled ? 'text-gray-700 hover:bg-gray-200' : 'text-white hover:bg-white hover:bg-opacity-20'} focus:outline-none`}>
                           <CartIcon />
                        </button>
                        
                        <div className="relative">
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} onBlur={() => setIsProfileOpen(false)} className={`p-2 rounded-full transition-colors duration-300 ${isScrolled ? 'text-gray-700 hover:bg-gray-200' : 'text-white hover:bg-white hover:bg-opacity-20'} focus:outline-none`}>
                               <UserIcon />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 hover:text-orange-600">My Profile</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 hover:text-orange-600">Order History</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 hover:text-orange-600">Settings</a>
                                    <div className="border-t border-gray-100"></div>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 hover:text-orange-600">Logout</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} type="button" className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-300 ${isScrolled ? 'text-gray-700 hover:bg-gray-200' : 'text-white hover:bg-white hover:bg-opacity-20'} focus:outline-none`}>
                            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white shadow-lg">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map(link => (
                           <a key={link.text} href={link.href || '#'} className="text-gray-700 hover:text-orange-600 block px-3 py-2 rounded-md text-base font-medium">{link.text}</a>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;