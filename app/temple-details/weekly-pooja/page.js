'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Loader2 } from 'lucide-react';

export default function WeeklyPoojaPage() {
    const [upcomingPoojas, setUpcomingPoojas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Static recurring poojas removed as per user request to only use Firestore data

    useEffect(() => {
        const fetchPoojas = async () => {
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');

                const q = query(collection(db, "poojas"), orderBy("createdAt", "desc"));

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setUpcomingPoojas(data);
                    setLoading(false);
                }, (error) => {
                    console.error("Error in Weekly Pooja snapshot listener:", error);
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Error fetching poojas:", error);
                setLoading(false);
            }
        };

        fetchPoojas();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-kumkum mb-8 border-b-2 border-orange-200 pb-4">
                வாராந்திர சிறப்பு பூஜைகள்
            </h1>

            {/* UPCOMING DYNAMIC POOJAS */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Calendar className="text-kumkum" /> Upcoming Scheduled Poojas
                </h2>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-kumkum animate-spin" />
                    </div>
                ) : (
                    <>
                        {(() => {
                            const today = new Date().toISOString().split('T')[0];
                            // Sorting function helpers
                            const sortByDateAsc = (a, b) => a.date.localeCompare(b.date);
                            const sortByDateDesc = (a, b) => b.date.localeCompare(a.date);

                            const upcomingList = upcomingPoojas
                                .filter(p => p.date >= today)
                                .sort(sortByDateAsc);

                            const pastList = upcomingPoojas
                                .filter(p => p.date < today)
                                .sort(sortByDateDesc);

                            const formatTime = (time24) => {
                                if (!time24) return '';
                                const [hours, minutes] = time24.split(':');
                                const h = parseInt(hours, 10);
                                const suffix = h >= 12 ? 'PM' : 'AM';
                                const formattedHour = h % 12 || 12;
                                return `${formattedHour}:${minutes} ${suffix}`;
                            };

                            const renderPoojaCard = (pooja, isCompleted) => (
                                <div key={pooja.id} className={`rounded-xl shadow-md overflow-hidden border transition-shadow relative ${isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100 hover:shadow-lg'}`}>
                                    <div className={`${isCompleted ? 'bg-gray-500' : 'bg-kumkum'} text-white p-4`}>
                                        <h3 className="text-xl font-bold">{isCompleted ? "Completed Pooja" : pooja.title}</h3>
                                        {pooja.tamilMonthDate && <span className="text-xs bg-white/20 px-2 py-1 rounded inline-block mt-1">{pooja.tamilMonthDate}</span>}
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Calendar className={`w-5 h-5 shrink-0 ${isCompleted ? 'text-gray-500' : 'text-kumkum'}`} />
                                            <span className="font-medium">{pooja.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Clock className={`w-5 h-5 shrink-0 ${isCompleted ? 'text-gray-500' : 'text-kumkum'}`} />
                                            <span>{formatTime(pooja.time)}</span>
                                        </div>

                                        <div className="flex items-center gap-3 text-gray-700 border-t border-gray-100 pt-3">
                                            <User className={`w-5 h-5 shrink-0 ${isCompleted ? 'text-gray-500' : 'text-kumkum'}`} />
                                            <div className="text-sm">
                                                <span className="block font-semibold">{pooja.sponsor} {pooja.sponsor2 && `& ${pooja.sponsor2}`}</span>
                                                {pooja.sponsorCurrentAddress && (
                                                    <span className="block text-gray-500 text-xs mt-1">
                                                        <span className={`font-semibold ${isCompleted ? 'text-gray-600' : 'text-kumkum'}`}>இருப்பு:</span> {pooja.sponsorCurrentAddress}
                                                    </span>
                                                )}
                                                {pooja.sponsorPermanentAddress && (
                                                    <span className="block text-gray-500 text-xs mt-1">
                                                        <span className={`font-semibold ${isCompleted ? 'text-gray-600' : 'text-kumkum'}`}>சொந்த ஊர்:</span> {pooja.sponsorPermanentAddress}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {pooja.description && <p className="text-gray-600 text-sm mt-3 bg-white p-3 rounded border border-gray-100 shadow-sm">{pooja.description}</p>}
                                    </div>
                                </div>
                            );

                            return (
                                <>
                                    {/* Upcoming Section */}
                                    {upcomingList.length > 0 ? (
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                                            {upcomingList.map(p => renderPoojaCard(p, false))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic bg-gray-50 p-6 rounded-lg mb-12">No upcoming poojas scheduled.</p>
                                    )}

                                    {/* Past Section */}
                                    {pastList.length > 0 && (
                                        <div className="pt-8 border-t border-gray-200">
                                            <h2 className="text-2xl font-bold text-gray-500 mb-6 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                </div>
                                                Completed Poojas
                                            </h2>
                                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-80">
                                                {pastList.map(p => renderPoojaCard(p, true))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </>
                )}
            </div>
        </div>
    );
}
