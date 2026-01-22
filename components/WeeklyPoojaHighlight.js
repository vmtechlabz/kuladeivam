'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WeeklyPoojaHighlight() {
    const [nextPooja, setNextPooja] = useState(null);

    useEffect(() => {
        const fetchPooja = async () => {
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, query, orderBy, limit, getDocs, where } = await import('firebase/firestore');

                const today = new Date().toISOString().split('T')[0];

                // 1. Try to get the next upcoming pooja
                const upcomingQuery = query(
                    collection(db, "poojas"),
                    where("date", ">=", today),
                    orderBy("date", "asc"),
                    limit(1)
                );

                const upcomingSnapshot = await getDocs(upcomingQuery);

                if (!upcomingSnapshot.empty) {
                    setNextPooja(upcomingSnapshot.docs[0].data());
                } else {
                    // 2. If no upcoming, get the most recent past pooja
                    const pastQuery = query(
                        collection(db, "poojas"),
                        where("date", "<", today),
                        orderBy("date", "desc"),
                        limit(1)
                    );
                    const pastSnapshot = await getDocs(pastQuery);

                    if (!pastSnapshot.empty) {
                        setNextPooja(pastSnapshot.docs[0].data());
                    }
                }
            } catch (error) {
                console.error("Error fetching weekly pooja:", error);
            }
        };

        fetchPooja();
    }, []);

    if (!nextPooja) {
        return null; // Or show a loading skeleton / "No upcoming poojas" message
    }

    // Helper to check if date is in the past
    // Assuming date is in YYYY-MM-DD format from the admin input
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = nextPooja.date < today;
    const displayTitle = isCompleted ? "Completed Pooja" : nextPooja.title;

    // Date parsing for display
    let day = "";
    let month = "";

    if (nextPooja.date.includes('-')) {
        const parts = nextPooja.date.split('-'); // 2026-01-17
        if (parts.length === 3) {
            day = parts[2];
            const monthNum = parseInt(parts[1]);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            month = monthNames[monthNum - 1] || parts[1];
        }
    } else {
        const parts = nextPooja.date.split(' ');
        day = parts[0] || "";
        month = parts.length > 1 ? parts[1] : "";
    }

    const dayName = nextPooja.tamilMonthDate ? nextPooja.tamilMonthDate.split(' ')[0] : "சிறப்பு";

    // Time formatting helper
    const formatTime = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${minutes} ${suffix}`;
    };

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-kumkum pl-4">
                        {isCompleted ? "Recent Pooja" : "அடுத்த சிறப்பு பூஜை"}
                    </h2>
                    <Link href="/temple-details/weekly-pooja" className="text-kumkum hover:text-gold font-medium flex items-center gap-1">
                        மேலும் பார்க்க <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="bg-orange-50 rounded-2xl p-8 border border-orange-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                    <div className="bg-kumkum text-white p-6 rounded-xl text-center min-w-[150px]">
                        <span className="block text-4xl font-bold">{day}</span>
                        <span className="block text-lg uppercase tracking-wide">{month}</span>
                        {/* If we had a specific day field, we'd use it. For now, try to show something relevant or just the tamil date */}
                        <span className="block text-sm opacity-80 mt-1">{nextPooja.tamilMonthDate || "சிறப்பு நாள்"}</span>
                    </div>

                    <div className="flex-grow">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{displayTitle}</h3>
                        <p className="text-gray-600 mb-6">{nextPooja.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-gray-700">
                                <Calendar className="w-5 h-5 text-kumkum" />
                                <span>{nextPooja.date} {nextPooja.time && ` | ${formatTime(nextPooja.time)}`}</span>
                            </div>

                            {/* Hide standard sponsor details for Shivaratri, show Annadhanam instead if present */}
                            {nextPooja.title === 'சிவராத்திரி சிறப்பு பூஜை' ? (
                                nextPooja.annadhanamDetails && (
                                    <div className="flex items-center gap-3 text-gray-700 md:col-span-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                        <User className="w-5 h-5 text-yellow-600" />
                                        <div className="text-sm">
                                            <span className="block font-bold text-yellow-800 mb-1">அன்னதானம் / சிறப்பு விவரங்கள்:</span>
                                            <span className="block text-gray-800 leading-relaxed whitespace-pre-wrap">{nextPooja.annadhanamDetails}</span>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="flex items-center gap-3 text-gray-700 md:col-span-2">
                                    <User className="w-5 h-5 text-kumkum" />
                                    <div className="text-sm">
                                        <span className="block">உபயதாரர்: <span className="font-semibold">{nextPooja.sponsor}</span>{nextPooja.sponsor2 && <span className="font-semibold"> & {nextPooja.sponsor2}</span>}</span>
                                        {nextPooja.sponsorCurrentAddress && <span className="block text-gray-500 mt-1">இருப்பு: {nextPooja.sponsorCurrentAddress}</span>}
                                        {nextPooja.sponsorPermanentAddress && <span className="block text-gray-500 mt-1">சொந்த ஊர்: {nextPooja.sponsorPermanentAddress}</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
