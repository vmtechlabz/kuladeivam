'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

export default function Notices() {
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        // Try to import Firestore dynamically to avoid build errors if env vars are missing
        const fetchNotices = async () => {
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, onSnapshot, query, where, orderBy } = await import('firebase/firestore');

                // Query for active notices, ordered by priority or date
                // Note: You might need to create an index for this query in Firebase Console
                const q = query(
                    collection(db, "notices"),
                    where("active", "==", true),
                    orderBy("createdAt", "desc")
                );

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const loadedNotices = snapshot.docs.map(doc => doc.data().content).filter(content => content.length < 300);
                    if (loadedNotices.length > 0) {
                        setNotices(loadedNotices);
                    } else {
                        setNotices([]);
                    }
                }, (error) => {
                    console.error("Error fetching notices:", error);
                    setNotices([]);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Firebase not initialized or configured:", error);
                setNotices([]);
            }
        };

        fetchNotices();
    }, []);

    return (
        <div className="bg-amber-100 border-y border-amber-200 py-2 overflow-hidden relative flex items-center">
            <div className="bg-amber-100 z-10 px-2 pl-3 md:pl-4 flex items-center gap-1.5 md:gap-2 text-kumkum font-bold whitespace-nowrap">
                <Bell className="w-4 h-4 md:w-5 md:h-5 animate-bounce" />
                <span className="text-sm md:text-base">அறிவிப்புகள்:</span>
            </div>
            <div className="whitespace-nowrap flex animate-marquee">
                {/* Repeating the notices to ensure smooth loop if content is short */}
                {[...notices, ...notices, ...notices].map((notice, index) => (
                    <span key={index} className="mx-5 md:mx-8 text-sm md:text-lg font-medium text-gray-800">
                        • {notice}
                    </span>
                ))}
            </div>

            {/* Inline styles for scrolling animation until we add it to global CSS properly */}
            <style jsx>{`
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
}
