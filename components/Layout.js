'use client';

import Link from 'next/link';
import { Menu, X, Home, Info, Calendar, Bell, Heart, Users, Instagram } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navItems = [
        { name: 'முகப்பு', href: '/', icon: Home },
        {
            name: 'கோவில் விவரங்கள்',
            icon: Info,
            children: [
                { name: 'வழிபாட்டு பலன்கள்', href: '/temple-details/benefits', icon: Heart },
                { name: 'வாராந்திர பூஜை', href: '/temple-details/weekly-pooja', icon: Calendar },
                { name: 'அறிவிப்புகள்', href: '/notices', icon: Bell },
                { name: 'நிர்வாகக்குழு', href: '/committee', icon: Users }
            ]
        },
    ];

    // Mobile specific state for submenus
    const [expandedMenu, setExpandedMenu] = useState(null);
    const toggleSubMenu = (index) => {
        setExpandedMenu(expandedMenu === index ? null : index);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-amber-50">
            {/* Navbar */}
            <nav className="bg-kumkum text-white shadow-lg sticky top-0 z-50">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex min-h-16 py-2 items-center justify-between gap-2 md:gap-8">
                        {/* Title Section - Allowed to shrink */}
                        <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/1.png" alt="Logo" className="w-12 h-12 md:w-20 md:h-20 object-contain drop-shadow-md shrink-0" />
                            <span className="text-sm md:text-xl font-bold text-left leading-tight whitespace-normal break-words">
                                ஸ்ரீ தேவி பூதேவி சமேத ஸ்ரீ வரதராஜப் பெருமாள் திருக்கோவில்
                            </span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex space-x-3 items-center flex-shrink-0">
                            {navItems.map((item, index) => (
                                item.children ? (
                                    <div key={item.name} className="relative group">
                                        <button className="flex items-center gap-1 hover:text-gold transition-colors duration-200 py-2 focus:outline-none">
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.name}</span>
                                        </button>

                                        {/* Dropdown Content */}
                                        <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                                            <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className="flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-orange-50 hover:text-kumkum border-b border-gray-50 last:border-0 transition-colors"
                                                    >
                                                        <child.icon className="w-4 h-4 text-kumkum" />
                                                        <span className="text-sm font-medium">{child.name}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center gap-1 hover:text-gold transition-colors duration-200"
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            ))}
                            <Link
                                href="/admin"
                                className="bg-gold text-kumkum px-4 py-1 rounded-full font-semibold hover:bg-white transition-colors"
                            >
                                Admin
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center flex-shrink-0">
                            <button onClick={toggleMenu} className="text-white hover:text-gold focus:outline-none">
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Panel */}
                {isMenuOpen && (
                    <div className="md:hidden bg-kumkum pb-4 px-4 shadow-inner">
                        <div className="flex flex-col space-y-2 mt-2">
                            {navItems.map((item, index) => (
                                item.children ? (
                                    <div key={item.name} className="border-b border-red-700 last:border-0">
                                        <button
                                            onClick={() => toggleSubMenu(index)}
                                            className="w-full flex items-center justify-between py-2 text-lg hover:text-gold text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className="w-5 h-5" />
                                                <span>{item.name}</span>
                                            </div>
                                            <span className={`transform transition-transform ${expandedMenu === index ? 'rotate-180' : ''}`}>▼</span>
                                        </button>

                                        {/* Mobile Submenu Accordion */}
                                        {expandedMenu === index && (
                                            <div className="pl-8 pb-2 space-y-2 bg-red-900/20 rounded-lg mb-2">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className="flex items-center gap-2 py-2 text-white/90 hover:text-gold text-base"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        <child.icon className="w-4 h-4" />
                                                        <span>{child.name}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center gap-3 text-lg py-2 border-b border-red-700 last:border-0 hover:text-gold"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            ))}
                            <Link
                                href="/admin"
                                className="bg-gold text-kumkum px-4 py-2 text-center rounded-md font-bold mt-4"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Admin
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-lg font-medium text-gold mb-4 italic">
                        "பாரம்பரியத்தைப் பாதுகாத்தல், ஆன்மீகத்தை வளர்த்தல் மற்றும் பக்தியுடன் சமூகத்திற்குச் சேவை செய்தல்."
                    </p>
                    <div className="flex justify-center gap-6 mb-6">
                        <a href="https://www.instagram.com/kulathaivam_varatharajaperumal/?hl=en" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                            <Instagram size={24} />
                            <span className="sr-only">Instagram</span>
                        </a>
                    </div>
                    <p className="mb-2 text-sm text-gray-400">
                        © {new Date().getFullYear()} ஸ்ரீ தேவி பூதேவி சமேத ஸ்ரீ வரதராஜப் பெருமாள் திருக்கோவில். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. | பக்தியுடன் உருவாக்கப்பட்டது.
                    </p>
                    <p className="text-xs text-gray-500 mt-4 border-t border-gray-800 pt-4">
                        Developed by <a href="#" className="text-orange-400 hover:text-gold font-bold transition-colors tracking-wide bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">VM TechLabs</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
