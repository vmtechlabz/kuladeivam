import Hero from "../components/Hero";
import Notices from "../components/Notices";
import WeeklyPoojaHighlight from "../components/WeeklyPoojaHighlight";
import GalleryPreview from "../components/GalleryPreview";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <Notices />
            <Hero />

            {/* Temple Info Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome & Intro */}
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="mt-2 text-2xl md:text-4xl font-bold text-gray-900 mb-6">எங்கள் தெய்வீக மரபு</h2>
                        <p className="text-xl text-gray-600 leading-relaxed mb-4">
                            எங்கள் புனிதமான குலதெய்வம் கோவிலுக்கு உங்களை வரவேற்கிறோம். இறைவனின் ஆசீர்வாதம் எப்போதும் உங்களுடன் இருக்கட்டும்.
                        </p>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            குலதெய்வம் வரலாறு என்பது தமிழ் மரபில் ஒவ்வொரு குடும்பமும் தலைமுறைகளாக வழிபடும் குலதெய்வம் அல்லது கிராம தெய்வத்தின் கதைகள், தோற்றம் மற்றும் வழிபாட்டு முறைகளைப் பற்றியது; இது குடும்பத்தின் அமைதி, செழிப்பு மற்றும் பாதுகாப்பிற்காக வணங்கப்படும் ஒரு மூதாதையர் தெய்வம், பெரும்பாலும் கிராமக் காவல் தெய்வங்கள் (Gramadevata) மற்றும் தனிப்பட்ட தெய்வங்களிலிருந்து (Ishta Devata) வேறுபடுகிறது, மேலும் இது குடும்பத்தின் பாரம்பரியத்தையும் அடையாளத்தையும் குறிக்கிறது.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 border-y border-orange-100 py-12">
                        {[
                            { label: "பாரம்பரியம் மிக்க ஆண்டுகள்", value: "100+" },
                            { label: "பக்தர்கள் சேவை", value: "10k+" },
                            { label: "ஆண்டு விழாக்கள்", value: "12+" },
                            { label: "தினசரி ஆசீர்வாதம்", value: "∞" }
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl md:text-4xl font-bold text-kumkum mb-2">{stat.value}</div>
                                <div className="text-sm md:text-base text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* History & Traditions Layout */}
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                        {/* History Column */}
                        <div className="bg-orange-50 rounded-2xl p-8 border border-orange-100">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <span className="w-2 h-8 bg-kumkum rounded-full"></span>
                                குலதெய்வத்தின் வரலாறு & முக்கியத்துவம்
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "மூதாதையர் வழிபாடு: குலதெய்வம் என்பது நமது முன்னோர்கள் வழிபட்ட, பரம்பரை பரம்பரையாகக் காத்து வரும் தெய்வம்.",
                                    "பாதுகாப்பு: குடும்பத்தில் நடக்கும் திருமணம், பிறப்பு போன்ற முக்கிய நிகழ்வுகளின் போது குலதெய்வத்தின் அருள் குடும்பத்தைப் பாதுகாக்கும் என்பது நம்பிக்கை.",
                                    "கோத்திரத்துடன் தொடர்பு: ஒரு குறிப்பிட்ட குலம், கோத்திரம் அல்லது வம்சம் சேர்ந்து வழிபடும் தெய்வமாக இது இருக்கலாம்.",
                                    "வேறுபாடு: இது தனிப்பட்ட தெய்வமான இஷ்ட தெய்வத்திலிருந்தும், கிராம தெய்வங்களான கிராம தேவதைகளிலிருந்தும் வேறுபட்டது.",
                                    "சக்தி: குலதெய்வத்தின் ஆசி இல்லாமல் எந்த காரியமும் முழுமையடையாது என்ற வலுவான நம்பிக்கை உள்ளது."
                                ].map((point, i) => (
                                    <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
                                        <span className="text-kumkum text-lg">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Traditions Column */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-gold rounded-full"></span>
                                    வழிபாட்டு மரபுகள்
                                </h3>
                                <ul className="space-y-4">
                                    {[
                                        "ஆண்டு வழிபாடு: வருடத்திற்கு ஒரு முறையாவது குலதெய்வத்தை தரிசனம் செய்வது அவசியம் என்று கருதப்படுகிறது.",
                                        "கண்டுபிடிப்பது எப்படி: குலதெய்வம் தெரியாதவர்கள், ஜோதிடர்கள் மூலமாகவோ அல்லது சில ஆன்மிக முறைகள் மூலமாகவோ தங்கள் குலதெய்வத்தைக் கண்டறிய முயற்சிப்பார்கள்.",
                                        "கோவில் அமைப்பு: குலதெய்வத்திற்கென சிறிய கோவில்கள், சாமியார்கள், அல்லது வீட்டிலேயே சிறிய பீடம் அமைத்து வழிபடுவார்கள்."
                                    ].map((point, i) => (
                                        <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
                                            <span className="text-gold font-bold text-lg">✦</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-2">சில பிரபலமான குலதெய்வங்கள்:</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    மதுரை வீரன், முனீஸ்வரன், சுடலைமாடன், மாரியம்மன், காளி, சப்த கன்னியர் போன்ற தெய்வங்கள் பல குடும்பங்களின் குலதெய்வங்களாக உள்ளன.
                                </p>
                            </div>

                            <p className="text-kumkum font-medium italic border-l-4 border-kumkum pl-4 py-2 bg-orange-50 rounded-r-lg">
                                "மொத்தத்தில், குலதெய்வ வரலாறு என்பது நமது வேர்களையும், பாரம்பரியத்தையும், ஆன்மிகப் பிணைப்பையும் உணர்த்தும் ஒரு முக்கிய அம்சமாகும்."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <WeeklyPoojaHighlight />
            <GalleryPreview />
        </div>
    );
}
