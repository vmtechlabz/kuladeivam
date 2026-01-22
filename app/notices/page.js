'use client';

import { useState, useEffect } from 'react';
import { Bell, Calendar } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function NoticesPage() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "notices"),
            where("active", "==", true),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedNotices = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert timestamp to date string if it exists
                date: doc.data().createdAt?.toDate().toLocaleDateString('ta-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) || 'Right Now'
            }));
            setNotices(loadedNotices);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notices:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-kumkum mb-8 flex items-center gap-2">
                <Bell className="w-8 h-8" />
                கோவில் அறிவிப்புகள்
            </h1>

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kumkum mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading notices...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {notices.length === 0 ? (
                        <p className="text-center text-gray-500 text-lg">தற்போது அறிவிப்புகள் ஏதும் இல்லை.</p>
                    ) : (
                        notices.map((notice) => (
                            <div key={notice.id} className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${notice.priority === 'high' ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {/* Since we don't have a separate title field yet, use a generic one or priority based */}
                                        {notice.priority === 'high' ? 'முக்கிய அறிவிப்பு' : 'அறிவிப்பு'}
                                    </h3>
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {notice.date}
                                    </span>
                                </div>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{notice.content}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
