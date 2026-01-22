'use client';

import { useState, useEffect } from 'react';
import { Users, MapPin, Phone, Loader2 } from 'lucide-react';

export default function CommitteePage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');

                const q = query(collection(db, "committee"), orderBy("createdAt", "asc"));

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching committee:", error);
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Error init firebase:", error);
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-kumkum mb-4 flex items-center justify-center gap-3">
                    <Users className="w-8 h-8" />
                    கோவில் நிர்வாகக்குழு உறுப்பினர்கள்
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    கோவில் திருப்பணிகள் மற்றும் அன்றாட செயல்பாடுகளை நிர்வகிக்கும் அற்பணிப்புமிக்க உறுப்பினர்கள்.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-kumkum animate-spin" />
                </div>
            ) : members.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">உறுப்பினர்கள் விவரம் விரைவில் இணைக்கப்படும்.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
                    {members.map((member) => (
                        <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-orange-200 group">
                            <div className="flex flex-col h-full">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-kumkum transition-colors">{member.name}</h3>
                                    <span className="inline-block bg-orange-50 text-kumkum px-3 py-1 rounded-full text-sm font-semibold mt-2 border border-orange-100">
                                        {member.role}
                                    </span>
                                </div>

                                <div className="space-y-3 mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                                        <span>{member.location}</span>
                                    </div>
                                    {member.phone && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                                            <a href={`tel:${member.phone}`} className="hover:text-kumkum transition-colors font-medium">
                                                {member.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-amber-50 rounded-xl p-6 text-center border border-amber-100 max-w-3xl mx-auto">
                <p className="text-gray-700 italic font-medium">
                    "ஒவ்வொரு ஊர் சார்ந்த நிர்வாக குழு உறுப்பினர்கள் விரைவில் இங்கே சேர்க்கப்படுவார்கள்."
                </p>
            </div>
        </div>
    );
}
