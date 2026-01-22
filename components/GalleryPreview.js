'use client';

import { Image as ImageIcon, PlayCircle } from 'lucide-react';

export default function GalleryPreview() {
    const mediaItems = [
        { type: 'image', src: '/temple_1.jpg', alt: 'Temple Main View' },
        { type: 'image', src: '/temple_2.png', alt: 'Deity Altar' },
        { type: 'image', src: '/temple_3.jpg', alt: 'Festival Celebration' },
        {
            type: 'video',
            src: '/temple.mp4',
            alt: 'Temple Procession Video',
        },
    ];

    return (
        <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-kumkum pl-4 mb-8">
                    புகைப்படங்கள் மற்றும் காணொளிகள்
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mediaItems.map((item, index) => {
                        // Local Video
                        if (item.type === 'video') {
                            return (
                                <div key={index} className="group relative aspect-square overflow-hidden rounded-xl bg-black">
                                    <video
                                        src={item.src}
                                        className="object-cover w-full h-full"
                                        controls
                                        playsInline
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            );
                        }

                        // Static Image
                        const Content = () => (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.src}
                                    alt={item.alt}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ImageIcon className="w-10 h-10 text-white" />
                                </div>
                            </>
                        );

                        return (
                            <div key={index} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-200">
                                <Content />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
