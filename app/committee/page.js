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

    const membersWithRole = members.filter((member) => member.role?.trim());
    const membersWithoutRole = members.filter((member) => !member.role?.trim());

    const groupedMembers = membersWithRole.reduce((acc, member) => {
        const village = member.location?.trim() || 'மற்றவை';
        if (!acc[village]) acc[village] = [];
        acc[village].push(member);
        return acc;
    }, {});

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
                <div className="space-y-10 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(groupedMembers).map(([village, villageMembers]) => (
                            <section key={village} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <h2 className="text-xl font-bold text-kumkum mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    {village}
                                </h2>
                                <div className="space-y-4">
                                    {villageMembers.map((member) => (
                                        <div key={member.id} className="rounded-lg border border-gray-100 p-4 hover:border-orange-200 transition-all group">
                                            <div className="flex flex-col h-full">
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-kumkum transition-colors">
                                                    {member.name}
                                                </h3>
                                                <span className="inline-block bg-orange-50 text-kumkum px-3 py-1 rounded-full text-sm font-semibold mt-2 border border-orange-100 w-fit">
                                                    {member.role}
                                                </span>

                                                {member.phone && (
                                                    <div className="flex items-center gap-3 text-gray-600 mt-4 pt-4 border-t border-gray-50">
                                                        <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                                                        <a href={`tel:${member.phone}`} className="hover:text-kumkum transition-colors font-medium">
                                                            {member.phone}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {membersWithoutRole.length > 0 && (
                        <section>
                            <h2 className="text-xl md:text-2xl font-bold text-kumkum mb-4">
                                ஒவ்வொரு ஊர் சார்ந்த நிர்வாக குழு உறுப்பினர்கள் கீழ் வருமாறு:
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {membersWithoutRole.map((member) => (
                                    <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-orange-200 group">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-kumkum transition-colors">
                                            {member.name}
                                        </h3>
                                        {member.location && (
                                            <div className="flex items-center gap-3 text-gray-600 mt-4">
                                                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                                                <span>{member.location}</span>
                                            </div>
                                        )}
                                        {member.phone && (
                                            <div className="flex items-center gap-3 text-gray-600 mt-3">
                                                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                                                <a href={`tel:${member.phone}`} className="hover:text-kumkum transition-colors font-medium">
                                                    {member.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
