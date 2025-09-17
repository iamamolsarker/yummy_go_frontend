import React, { useState, useEffect } from 'react';

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

const Navbar: React.FC = () => {
    // State for mobile menu toggle
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    // State for profile dropdown toggle
    const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
    // State to track scroll position
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    // State to manage which dropdown is open
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    // State to track the active navigation link
    const [activeLink, setActiveLink] = useState<string>('Home');

    // Effect to handle scroll event
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Inline SVG Icons
    const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
    const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
    const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;
    const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
    const ChevronDownIcon = () => <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;

    // Updated navigation links data structure
    const navLinks: NavLink[] = [
        { text: 'Home', href: '#home' },
        { text: 'Indian', dropdown: [{ text: 'Indian Thali', href: '#indian-thali' }, { text: 'South Indian', href: '#south-indian' }] },
        { text: 'Italian', dropdown: [{ text: 'Pizza', href: '#pizza' }, { text: 'Pasta', href: '#pasta' }] },
        { text: 'Thai', dropdown: [{ text: 'Thai Curry', href: '#thai-curry' }, { text: 'Thai Soup', href: '#thai-soup' }] },
        { text: 'Chinese', href: '#chinese' },
        { text: 'Shop', href: '#shop' },
        { text: 'Pages', dropdown: [{ text: 'About Us', href: '#about' }, { text: 'FAQ', href: '#faq' }, { text: '404 Page', href: '#404' }] },
    ];

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
                ? "bg-white shadow-md"
                : "bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* SVG Logo */}
                    <div className="flex-shrink-0">
                        <a href="/" className="flex items-center">
                            <img src="/yummy-go.svg" alt="YummyGo Logo" className="h-20 w-auto" />
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map(link => (
                            <div
                                key={link.text}
                                className="relative"
                                onMouseEnter={() => link.dropdown && setOpenDropdown(link.text)}
                                onMouseLeave={() => link.dropdown && setOpenDropdown(null)}
                            >
                                <a
                                    href={link.href || '#'}
                                    onClick={() => !link.dropdown && setActiveLink(link.text)}
                                    className={`flex items-center px-3 py-2 rounded-[10px] text-[16px] font-medium transition-colors duration-300 
                                        ${isScrolled ? 'text-[#363636] hover:text-[#EF451C]' : 'text-gray-200 hover:text-white'}
                                        ${activeLink === link.text && isScrolled ? 'text-[#EF451C]' : ''}
                                        ${activeLink === link.text && !isScrolled ? 'text-white font-semibold' : ''}
                                    `}
                                >
                                    {link.text}
                                    {link.dropdown && <ChevronDownIcon />}
                                </a>
                                {link.dropdown && openDropdown === link.text && (
                                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-[10px] shadow-lg py-1 z-20 border border-[#3636361a]">
                                        {link.dropdown.map(item => (
                                            <a key={item.text} href={item.href} className="block px-4 py-2 text-[16px] text-[#363636] hover:bg-[#EF451C]/10 hover:text-[#EF451C]">{item.text}</a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Desktop Icons - Reordered */}
                    <div className="hidden md:flex items-center space-x-2">
                        <div className="relative">
                            <button onFocus={() => setIsProfileOpen(true)} onBlur={() => setIsProfileOpen(false)} className={`p-2 rounded-full transition-colors duration-300 ${isScrolled ? 'text-[#363636] hover:bg-[#363636]/10' : 'text-white hover:bg-white/20'} focus:outline-none`}>
                                <UserIcon />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-[10px] shadow-lg py-1 z-20 border border-[#3636361a]">
                                    <a href="#" className="block px-4 py-2 text-[16px] text-[#363636] hover:bg-[#EF451C]/10 hover:text-[#EF451C]">My Profile</a>
                                    <a href="#" className="block px-4 py-2 text-[16px] text-[#363636] hover:bg-[#EF451C]/10 hover:text-[#EF451C]">Order History</a>
                                    <a href="#" className="block px-4 py-2 text-[16px] text-[#363636] hover:bg-[#EF451C]/10 hover:text-[#EF451C]">Settings</a>
                                    <div className="border-t border-[#3636361a]"></div>
                                    <a href="#" className="block px-4 py-2 text-[16px] text-[#363636] hover:bg-[#EF451C]/10 hover:text-[#EF451C]">Logout</a>
                                </div>
                            )}
                        </div>
                        <button className={`p-2 rounded-full transition-colors duration-300 ${isScrolled ? 'text-[#363636] hover:bg-[#363636]/10' : 'text-white hover:bg-white/20'} focus:outline-none`}><CartIcon /></button>
                        <button className={`p-2 rounded-full transition-colors duration-300 ${isScrolled ? 'text-[#363636] hover:bg-[#363636]/10' : 'text-white hover:bg-white/20'} focus:outline-none`}><HeartIcon /></button>
                        <button className={`p-2 rounded-full transition-colors duration-300 ${isScrolled ? 'text-[#363636] hover:bg-[#363636]/10' : 'text-white hover:bg-white/20'} focus:outline-none`}><SearchIcon /></button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} type="button" className={`inline-flex items-center justify-center p-2 rounded-[10px] transition-colors duration-300 ${isScrolled ? 'text-[#363636] hover:bg-[#363636]/10' : 'text-white hover:bg-white/20'} focus:outline-none`}>
                            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white shadow-lg border-t border-[#3636361a]">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map(link => (
                            <a
                                key={link.text}
                                href={link.href || '#'}
                                onClick={() => { setActiveLink(link.text); setIsMenuOpen(false); }}
                                className={`block px-3 py-2 rounded-[10px] text-[16px] font-medium
                                    ${activeLink === link.text ? 'text-[#EF451C] bg-[#EF451C]/10' : 'text-[#363636] hover:text-[#EF451C] hover:bg-[#EF451C]/10'}`
                                }
                            >
                                {link.text}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

