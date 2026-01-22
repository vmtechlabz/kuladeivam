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

            <div className="relative z-10 max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8 mt-60">
                {/* Thirunamam Logo */}
                {/* Custom Flame/Conch Logo Image */}
                <div className="flex justify-center" style={{ marginTop: '60px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/1.png"
                        alt="Temple Logo"
                        className="w-32 h-32 object-contain drop-shadow-2xl filter hover:scale-105 transition-transform duration-300"
                        style={{ filter: 'drop-shadow(0 0 15px rgba(255, 107, 0, 0.4))' }}
                    />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-2 text-white drop-shadow-2xl tracking-wide leading-tight">
                    ஸ்ரீ தேவி பூதேவி சமேத <br /> ஸ்ரீ வரதராஜப் பெருமாள் திருக்கோவில்
                </h1>
                <p className="text-xl md:text-3xl font-medium mb-10 text-amber-200 drop-shadow-lg">
                    செட்டிகுறிச்சி, திருநெல்வேலி
                </p>

            </div>
        </div>
    );
}
