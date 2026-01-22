import Link from 'next/link';
import { Calendar, Info, Heart } from 'lucide-react';

export default function TempleDetailsPage() {
    const sections = [
        {
            title: "வாராந்திர பூஜைகள்",
            description: "தினசரி மற்றும் வாராந்திர சிறப்பு பூஜைகள் பற்றிய விவரங்கள்.",
            icon: Calendar,
            href: "/temple-details/weekly-pooja"
        },
        // Future expansion:
        // { title: "கோவில் நன்மைகள்", description: "வழிபாட்டின் பலன்கள்", icon: Heart, href: "/temple-details/benefits" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-kumkum mb-8">கோவில் விவரங்கள்</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sections.map((section, index) => (
                    <Link key={index} href={section.href} className="group block h-full">
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 h-full transition-transform hover:-translate-y-1 hover:shadow-lg">
                            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-kumkum group-hover:text-white transition-colors">
                                <section.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                            <p className="text-gray-600">{section.description}</p>
                        </div>
                    </Link>
                ))}
                {/* Placeholder for future content */}
                <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center">
                    <Info className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">மேலும் தகவல்கள் விரைவில்...</p>
                </div>
            </div>
        </div>
    );
}
