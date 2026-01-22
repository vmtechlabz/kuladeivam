export default function Hero() {
    return (
        <div className="relative h-[600px] flex items-center justify-center overflow-y-hidden">
            {/* Background Image - Replace 'src' with your local image or direct URL */}
            <div
                className="absolute inset-0 bg-cover bg-[center_35%] z-0 transition-transform duration-700 hover:scale-100"
                style={{
                    backgroundImage: `url('/temple-banner.webp')`,
                    // For the Instagram image, download it and place in public/ folder, then use: url('/your-image.jpg')
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/80"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8 mt-72">
                {/* Thirunamam Logo */}
                <div className="flex justify-center mb-8">
                    <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-2xl filter" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))' }}>
                        {/* Outer Namam (White) */}
                        <path d="M25,10 L25,55 C25,85 75,85 75,55 L75,10" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
                        {/* Inner Sreechurnam (Red) */}
                        <line x1="50" y1="15" x2="50" y2="85" stroke="#C41E3A" strokeWidth="6" strokeLinecap="round" />
                    </svg>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-2xl tracking-wide leading-tight">
                    ஸ்ரீ தேவி பூதேவி சமேத <br /> ஸ்ரீ வரதராஜப் பெருமாள் திருக்கோவில்
                </h1>
                <p className="text-xl md:text-3xl font-medium mb-10 text-amber-200 drop-shadow-lg">
                    செட்டிகுறிச்சி, திருநெல்வேலி
                </p>

            </div>
        </div>
    );
}
