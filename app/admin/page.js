'use client';

import { useState, useEffect } from 'react';
import { auth, db, storage } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Trash2, Edit2, X, Calendar, Clock, MapPin, User, FileText, Globe, image as ImageIcon, Video, Upload, AlertCircle, Users } from 'lucide-react';

import SafeTransliterate from '@/components/SafeTransliterate';
import { getTamilDate } from '@/utils/tamilDateUtils';

export default function AdminPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Content Management State
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeStatus, setNoticeStatus] = useState('');
    const [notices, setNotices] = useState([]);
    const [deletingIds, setDeletingIds] = useState(new Set());
    const [editingId, setEditingId] = useState(null);

    // Custom Delete Confirmation State
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, id: null, type: null, isLoading: false });

    // Weekly Pooja State
    const [activeTab, setActiveTab] = useState('notices'); // 'notices' | 'pooja' | 'gallery'
    const [poojas, setPoojas] = useState([]);
    const [poojaEditingId, setPoojaEditingId] = useState(null);
    const [poojaStatus, setPoojaStatus] = useState('');

    // Pooja Form Fields
    const [poojaTitle, setPoojaTitle] = useState('பிரதோஷ வழிபாடு');
    const [poojaCustomTitle, setPoojaCustomTitle] = useState('');
    const [poojaDate, setPoojaDate] = useState('');
    const [poojaTime, setPoojaTime] = useState('');

    // Multi-Sponsor State
    const [sponsors, setSponsors] = useState([{ prefix: 'திரு', name: '' }]);

    const [poojaSponsor, setPoojaSponsor] = useState('');
    const [poojaSponsor2, setPoojaSponsor2] = useState('');
    const [sponsorCurrentAddress, setSponsorCurrentAddress] = useState('');
    const [sponsorPermanentAddress, setSponsorPermanentAddress] = useState('');
    const [poojaDescription, setPoojaDescription] = useState('');
    const [annadhanamDetails, setAnnadhanamDetails] = useState(''); // New State
    // Tamil Date State
    const [tamilMonth, setTamilMonth] = useState('');
    const [tamilDay, setTamilDay] = useState('');

    const tamilMonths = [
        "சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி",
        "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"
    ];
    const tamilDays = Array.from({ length: 32 }, (_, i) => i + 1);

    // Gallery State
    const [galleryTab, setGalleryTab] = useState('photos'); // 'photos' | 'videos'
    const [galleryItems, setGalleryItems] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [mediaUrlInput, setMediaUrlInput] = useState('');

    // Committee State
    const [committeeMembers, setCommitteeMembers] = useState([]);
    const [memberName, setMemberName] = useState('');
    const [memberRole, setMemberRole] = useState('');
    const [memberLocation, setMemberLocation] = useState('');
    const [memberPhone, setMemberPhone] = useState('');

    const [committeeStatus, setCommitteeStatus] = useState('');

    // Effect: Auto-calculate Tamil Date when Gregorian Date changes
    useEffect(() => {
        if (poojaDate) {
            const tDate = getTamilDate(poojaDate);
            if (tDate) {
                setTamilMonth(tDate.month);
                setTamilDay(tDate.day);
            }
        }
    }, [poojaDate]);

    useEffect(() => {
        if (!user) return;

        // Fetch notices
        const qNotices = query(collection(db, "notices"), orderBy("createdAt", "desc"));
        const unsubscribeNotices = onSnapshot(qNotices, (snapshot) => {
            setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Error fetching notices:", error);
            // Optional: set empty array or show error state
        });

        // Fetch Weekly Poojas
        const qPoojas = query(collection(db, "poojas"), orderBy("createdAt", "desc"));
        const unsubscribePoojas = onSnapshot(qPoojas, (snapshot) => {
            setPoojas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Error fetching poojas:", error);
        });

        /* Gallery Disabled to prevent permission error
        const qGallery = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
        const unsubscribeGallery = onSnapshot(qGallery, (snapshot) => {
            setGalleryItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        */

        // Fetch Committee Members
        const qCommittee = query(collection(db, "committee"), orderBy("createdAt", "asc"));
        const unsubscribeCommittee = onSnapshot(qCommittee, (snapshot) => {
            setCommitteeMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Error fetching committee:", error);
        });

        return () => {
            unsubscribeNotices();
            unsubscribePoojas();
            unsubscribeCommittee();
            // unsubscribeGallery();
        };
    }, [user]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let userCredential;

            // Only login allowed
            userCredential = await signInWithEmailAndPassword(auth, email, password);

            setUser(userCredential.user);
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError('Authentication failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!confirm('Are you sure you want to restore default poojas? This is for recovery purposes.')) return;
        setLoading(true);
        try {
            const batch = writeBatch(db);
            const poojasRef = collection(db, "poojas");
            const data = [
                { title: "தை முதல் நாள்", date: "2026-01-15", time: "06:00", tamilMonthDate: "தை 1", description: "Special pooja for Thai 1", sponsor: "Admin Restore" },
                { title: "மாசி மாத பிறப்பு", date: "2026-02-13", time: "06:00", tamilMonthDate: "மாசி 1", description: "Special pooja for Masi 1", sponsor: "Admin Restore" },
                { title: "பங்குனி உத்திரம்", date: "2026-03-15", time: "06:00", tamilMonthDate: "பங்குனி 1", description: "Special pooja for Panguni 1", sponsor: "Admin Restore" },
                { title: "தமிழிப் புத்தாண்டு", date: "2026-04-14", time: "06:00", tamilMonthDate: "சித்திரை 1", description: "Tamil New Year", sponsor: "Admin Restore" },
                { title: "வைகாசி விசாகம்", date: "2026-05-15", time: "06:00", tamilMonthDate: "வைகாசி 1", description: "Vaikasi Visakam", sponsor: "Admin Restore" }
            ];

            data.forEach(item => {
                const newDocRef = doc(poojasRef);
                batch.set(newDocRef, { ...item, createdAt: serverTimestamp() });
            });

            await batch.commit();
            alert('Restoration Complete!');
        } catch (e) {
            console.error(e);
            alert('Error restoring: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        setEmail('');
        setPassword('');
    };

    // --- NOTICE Handlers ---
    const handleAddOrUpdateNotice = async (e) => {
        e.preventDefault();
        if (!noticeContent.trim()) return;
        setNoticeStatus(editingId ? 'Updating...' : 'Adding...');

        try {
            if (editingId) {
                await updateDoc(doc(db, "notices", editingId), {
                    content: noticeContent,
                    updatedAt: serverTimestamp()
                });
                setNoticeStatus('Notice updated successfully!');
            } else {
                await addDoc(collection(db, "notices"), {
                    content: noticeContent,
                    active: true,
                    createdAt: serverTimestamp(),
                    priority: 'normal'
                });
                setNoticeStatus('Notice added successfully!');
            }

            setNoticeContent('');
            setEditingId(null);
            setTimeout(() => setNoticeStatus(''), 3000);
        } catch (err) {
            console.error("Error saving notice: ", err);
            setNoticeStatus('Error saving notice.');
        }
    };

    const handleEditClick = (notice) => {
        setNoticeContent(notice.content);
        setEditingId(notice.id);
        setNoticeStatus('');
    };

    const handleCancelEdit = () => {
        setNoticeContent('');
        setEditingId(null);
        setNoticeStatus('');
    };

    const handleDeleteNotice = async (id) => {
        if (!confirm('Are you sure you want to delete this notice?')) return;
        setDeletingIds(prev => new Set(prev).add(id));
        try {
            await deleteDoc(doc(db, "notices", id));
            if (editingId === id) handleCancelEdit();
        } catch (err) {
            console.error("Error deleting notice: ", err);
            alert("Error deleting notice");
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    // --- POOJA Handlers ---
    const handleSavePooja = async (e) => {
        e.preventDefault();
        setPoojaStatus(poojaEditingId ? 'Updating...' : 'Adding...');

        const finalTitle = poojaTitle === 'Other' ? poojaCustomTitle : poojaTitle;

        // Only append 'Family' if NOT Shivaratri
        // Only append 'Family' if NOT Shivaratri
        let finalSponsor = poojaSponsor;

        // Construct Sponsor String from Array
        // Format: "Prefix Name, Prefix Name" then append "Family" if needed
        // For simpler backward compatibility, we will just join them and store in 'sponsor' field

        const validSponsors = sponsors.filter(s => s.name && s.name.trim().length > 0);

        if (validSponsors.length > 0) {
            finalSponsor = validSponsors.map(s => `${s.prefix} ${s.name}`).join(', ');
        }

        let finalSponsor2 = ''; // Deprecated but kept empty or derived if needed

        if (finalTitle !== 'சிவராத்திரி சிறப்பு பூஜை') {
            // If manual parsing fails or uses old fields, fallback is safe.
            // Auto-append family if it's not already there?
            if (validSponsors.length > 0 && !finalSponsor.includes('குடும்பத்தார்')) {
                finalSponsor = `${finalSponsor} குடும்பத்தார்`;
            }
        }

        // Construct Tamil Month Date only if both are selected
        let finalTamilDate = '';
        if (tamilMonth && tamilDay) {
            finalTamilDate = `${tamilMonth} ${tamilDay}`;
        }

        const poojaData = {
            title: finalTitle,
            date: poojaDate,
            time: poojaTime,

            sponsor: finalSponsor,
            sponsor2: finalSponsor2,
            sponsorCurrentAddress,
            sponsorPermanentAddress,
            description: poojaDescription,
            annadhanamDetails: annadhanamDetails, // Save new field
            tamilMonthDate: finalTamilDate, // Can be empty string now
            updatedAt: serverTimestamp()
        };

        try {
            if (poojaEditingId) {
                await updateDoc(doc(db, "poojas", poojaEditingId), poojaData);
                setPoojaStatus('Pooja updated successfully!');
            } else {
                await addDoc(collection(db, "poojas"), {
                    ...poojaData,
                    createdAt: serverTimestamp()
                });
                setPoojaStatus('Pooja added successfully!');
            }
            resetPoojaForm();
            setTimeout(() => setPoojaStatus(''), 3000);
        } catch (err) {
            console.error("Error saving pooja: ", err);
            setPoojaStatus('Error saving pooja.');
        }
    };

    const handleEditPooja = (pooja) => {
        setPoojaTitle(['பிரதோஷ வழிபாடு', 'சிறப்பு பூஜை', 'சனிக்கிழமை பூஜை', 'சிவராத்திரி சிறப்பு பூஜை'].includes(pooja.title) ? pooja.title : 'Other');
        if (!['பிரதோஷ வழிபாடு', 'சிறப்பு பூஜை', 'சனிக்கிழமை பூஜை', 'சிவராத்திரி சிறப்பு பூஜை'].includes(pooja.title)) {
            setPoojaCustomTitle(pooja.title);
        }
        setPoojaDate(pooja.date || '');
        setPoojaTime(pooja.time || '');

        // Try to parse existing sponsor string
        const sponsorText = pooja.sponsor ? pooja.sponsor.replace(' குடும்பத்தார்', '').trim() : '';
        if (sponsorText) {
            // Split by comma if multiple
            const parts = sponsorText.split(',').map(s => s.trim());
            const parsedSponsors = parts.map(part => {
                const prefixes = ['திரு', 'திருமதி', 'செல்வன்', 'செல்வி'];
                // Find if part starts with a known prefix
                const foundPrefix = prefixes.find(p => part.startsWith(p));
                if (foundPrefix) {
                    return { prefix: foundPrefix, name: part.replace(foundPrefix, '').trim() };
                } else {
                    return { prefix: 'திரு', name: part }; // Default fallback
                }
            });
            // Ensure at least one
            if (parsedSponsors.length === 0) parsedSponsors.push({ prefix: 'திரு', name: '' });
            setSponsors(parsedSponsors);
        } else {
            setSponsors([{ prefix: 'திரு', name: '' }]);
        }

        // setPoojaSponsor(pooja.sponsor.replace(' குடும்பத்தார்', '') || ''); // Deprecated view
        setSponsorCurrentAddress(pooja.sponsorCurrentAddress || '');
        setSponsorPermanentAddress(pooja.sponsorPermanentAddress || '');
        setPoojaDescription(pooja.description || '');
        setAnnadhanamDetails(pooja.annadhanamDetails || ''); // Load edit data

        // Reset defaults
        setTamilMonth('');
        setTamilDay('');

        if (pooja.tamilMonthDate) {
            const parts = pooja.tamilMonthDate.split(' ');
            if (parts.length >= 2) {
                setTamilMonth(parts[0]);
                setTamilDay(parts[1]);
            }
        }
        setPoojaEditingId(pooja.id);
    };

    const handleDeletePooja = (id) => {
        // Instead of window.confirm, use custom modal
        console.log("Requesting delete for:", id);
        setDeleteConfirmation({ show: true, id, type: 'pooja', isLoading: false });
    };

    const confirmDelete = async () => {
        const { id, type } = deleteConfirmation;
        if (!id) return;

        setDeleteConfirmation(prev => ({ ...prev, isLoading: true }));

        try {
            if (type === 'pooja') {
                console.log("Proceeding with delete for ID:", id);
                await deleteDoc(doc(db, "poojas", id));
                if (poojaEditingId === id) resetPoojaForm();
                console.log("Delete successful");
            }
            // Reset modal
            setDeleteConfirmation({ show: false, id: null, type: null, isLoading: false });
        } catch (err) {
            console.error("Error deleting:", err);
            alert("Error deleting: " + err.message);
            setDeleteConfirmation({ show: false, id: null, type: null, isLoading: false });
        }
    };

    const resetPoojaForm = () => {
        setPoojaTitle('பிரதோஷ வழிபாடு');
        setPoojaCustomTitle('');
        setPoojaDate('');
        setPoojaTime('');

        setPoojaSponsor('');
        setPoojaSponsor2('');
        setSponsorCurrentAddress('');
        setSponsorPermanentAddress('');
        setPoojaDescription('');
        setAnnadhanamDetails(''); // Reset new field
        setTamilMonth(''); // Start empty
        setTamilDay('');   // Start empty

        setSponsors([{ prefix: 'திரு', name: '' }]); // Reset sponsors

        setPoojaEditingId(null);
        setPoojaStatus('');
    };

    // --- GALLERY Handlers ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const type = file.type.startsWith('image/') ? 'photo' : file.type.startsWith('video/') ? 'video' : null;
        if (!type) { alert('Invalid file type'); return; }

        if (galleryTab === 'photos' && type !== 'photo') { alert('Please upload an image.'); return; }
        if (galleryTab === 'videos' && type !== 'video') { alert('Please upload a video.'); return; }

        // Check limits
        const currentCount = galleryItems.filter(item => item.type === type).length;
        const limit = type === 'photo' ? 50 : 5;

        if (currentCount >= limit) {
            alert(`Gallery Full! You have reached the limit of ${limit} ${type}s. Please delete old items to upload new ones.`);
            return;
        }

        setUploading(true);
        try {
            const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, "gallery"), {
                url: downloadURL,
                type: type,
                name: file.name,
                fullPath: snapshot.metadata.fullPath,
                createdAt: serverTimestamp()
            });
            alert('Upload successful!');
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading file. If Storage is not enabled, try adding by URL instead.");
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const handleAddMediaByUrl = async () => {
        if (!mediaUrlInput.trim()) return;

        const type = galleryTab === 'photos' ? 'photo' : 'video';
        const limit = type === 'photo' ? 50 : 5;
        const currentCount = galleryItems.filter(item => item.type === type).length;

        if (currentCount >= limit) {
            alert(`Gallery Full! You have reached the limit of ${limit} ${type}s.`);
            return;
        }

        try {
            await addDoc(collection(db, "gallery"), {
                url: mediaUrlInput,
                type: type,
                name: "Linked Media",
                createdAt: serverTimestamp()
            });
            setMediaUrlInput('');
            alert('Media linked successfully!');
        } catch (error) {
            console.error("Link error:", error);
            alert("Error linking media.");
        }
    };


    const handleDeleteMedia = async (item) => {
        if (!confirm('Delete this media item?')) return;
        try {
            // Only try to delete from storage if it has a fullPath (meaning it was uploaded)
            if (item.fullPath) {
                const fileRef = ref(storage, item.fullPath);
                await deleteObject(fileRef).catch(err => console.log("Storage delete skipped/failed", err));
            }
            // Delete from Firestore
            await deleteDoc(doc(db, "gallery", item.id));
        } catch (error) {
            console.error("Delete error:", error);
            alert("Error deleting item");
        }
    };

    // --- COMMITTEE Handlers ---
    const handleSaveMember = async (e) => {
        e.preventDefault();
        if (!memberName.trim() || !memberRole.trim()) return;
        setCommitteeStatus('Adding...');

        try {
            await addDoc(collection(db, "committee"), {
                name: memberName,
                role: memberRole,
                location: memberLocation,
                phone: memberPhone,
                createdAt: serverTimestamp()
            });
            setCommitteeStatus('Member added successfully!');
            setMemberName('');
            setMemberRole('');
            setMemberLocation('');
            setMemberPhone('');
            setTimeout(() => setCommitteeStatus(''), 3000);
        } catch (err) {
            console.error("Error saving member: ", err);
            setCommitteeStatus('Error saving member.');
        }
    };

    const handleDeleteMember = async (id) => {
        if (!confirm('Remove this member from committee?')) return;
        try { await deleteDoc(doc(db, "committee", id)); } catch (err) { console.error(err); }
    };



    if (user) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage Temple Content & Settings</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600 font-medium hidden md:inline">{user.email}</span>
                            <button onClick={handleLogout} className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm">
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex space-x-1 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 mb-8 w-full md:w-auto inline-flex overflow-x-auto">
                        {['notices', 'pooja', 'committee'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 md:flex-none py-2.5 px-6 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${activeTab === tab
                                    ? 'bg-kumkum text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {tab === 'notices' && 'Manage Notices'}
                                {tab === 'pooja' && 'Weekly Pooja'}
                                {tab === 'committee' && 'Committee'}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-end mb-4">
                        <a href="https://www.google.com/inputtools/try/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition">
                            <Globe size={14} /> Tamil Typing Help
                        </a>
                    </div>


                    {/* --- NOTICES TAB --- */}
                    {activeTab === 'notices' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
                                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                                    <FileText className="text-kumkum" size={24} />
                                    {editingId ? 'Edit Notice' : 'New Announcement'}
                                </h3>
                                {editingId && (
                                    <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm bg-white border px-3 py-1.5 rounded-lg shadow-sm">
                                        <X size={14} /> Cancel
                                    </button>
                                )}
                            </div>

                            <div className="p-8">
                                <form onSubmit={handleAddOrUpdateNotice} className="mb-10 relative">
                                    <SafeTransliterate
                                        value={noticeContent}
                                        onChangeText={(text) => setNoticeContent(text)}
                                        placeholder="Type notice content (Tanglish)..."
                                        rows="4"
                                        renderComponent={(props) => <textarea {...props} />}
                                        className={`w-full p-5 border rounded-xl focus:ring-4 focus:ring-orange-100 outline-none transition-all text-lg leading-relaxed shadow-inner ${editingId ? 'border-kumkum bg-orange-50/30' : 'border-gray-200'}`}
                                        containerClassName="w-full"
                                    />
                                    <div className="flex justify-between items-center mt-4">
                                        <span className={`text-sm font-medium ${noticeStatus.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{noticeStatus}</span>
                                        <button type="submit" className={`${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-kumkum hover:bg-red-700'} text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200/50 hover:shadow-xl transition-all flex items-center gap-2`}>
                                            {editingId ? <Edit2 size={18} /> : null}
                                            {editingId ? 'Update Notice' : 'Post Notice'}
                                        </button>
                                    </div>
                                </form>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-4">Active Announcements</h4>
                                    {notices.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-gray-400">No active notices.</p>
                                        </div>
                                    ) : (
                                        <ul className="grid gap-4">
                                            {notices.map((notice) => (
                                                <li key={notice.id} className="group flex justify-between items-start p-5 rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-md transition-all duration-200 relative">
                                                    <div className="flex-1 pr-8">
                                                        <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                                                        <span className="text-xs text-gray-400 mt-2 block font-medium">Posted: {notice.createdAt?.toDate().toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 md:relative md:top-auto md:right-auto bg-white md:bg-transparent p-1 md:p-0 rounded-lg shadow-sm md:shadow-none border md:border-none border-gray-100">
                                                        <button onClick={() => handleEditClick(notice)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Edit">
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleDeleteNotice(notice.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}


                    {/* --- POOJA TAB --- */}
                    {activeTab === 'pooja' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
                                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                                    <Calendar className="text-kumkum" size={24} />
                                    {poojaEditingId ? 'Edit Pooja' : 'Schedule Weekly Pooja'}
                                </h3>
                                {poojaEditingId && (
                                    <button onClick={resetPoojaForm} className="text-gray-500 border bg-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50">
                                        <X size={14} /> Cancel
                                    </button>
                                )}
                            </div>

                            <div className="p-8">
                                <form onSubmit={handleSavePooja} className="space-y-6 mb-10">
                                    {/* Row 1 */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-6">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Pooja Title</label>
                                            <div className="relative">
                                                <select
                                                    value={poojaTitle}
                                                    onChange={(e) => setPoojaTitle(e.target.value)}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum focus:bg-white transition-all appearance-none"
                                                >
                                                    <option value="பிரதோஷ வழிபாடு">பிரதோஷ வழிபாடு</option>
                                                    <option value="சிறப்பு பூஜை">சிறப்பு பூஜை</option>
                                                    <option value="சனிக்கிழமை பூஜை">சனிக்கிழமை பூஜை</option>
                                                    <option value="சிவராத்திரி சிறப்பு பூஜை">சிவராத்திரி சிறப்பு பூஜை</option>
                                                    <option value="Other">Other (Custom)</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">▼</div>
                                            </div>
                                            {poojaTitle === 'Other' && (
                                                <div className="mt-3">
                                                    <SafeTransliterate
                                                        renderComponent={(props) => <input {...props} />}
                                                        value={poojaCustomTitle}
                                                        onChangeText={(text) => setPoojaCustomTitle(text)}
                                                        placeholder="Enter Custom Title (Tanglish)"
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum"
                                                        containerClassName="w-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                            <input type="date" value={poojaDate} onChange={(e) => setPoojaDate(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum" required />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                                            <input type="time" value={poojaTime} onChange={(e) => setPoojaTime(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum" required />
                                        </div>
                                    </div>

                                    {/* Row 2 */}
                                    {/* Multi-Sponsor List */}
                                    <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-sm font-bold text-gray-800">Sponsors (Max 4)</label>
                                            <button
                                                type="button"
                                                onClick={() => setSponsors([...sponsors, { prefix: 'திரு', name: '' }])}
                                                disabled={sponsors.length >= 4}
                                                className="text-xs font-bold text-kumkum bg-white border border-orange-200 px-3 py-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50"
                                            >
                                                + Add Sponsor
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {sponsors.map((sponsor, index) => (
                                                <div key={index} className="flex gap-3 items-start relative bg-white p-3 rounded-lg border border-orange-100">
                                                    <select
                                                        value={sponsor.prefix}
                                                        onChange={(e) => {
                                                            const newSponsors = [...sponsors];
                                                            newSponsors[index].prefix = e.target.value;
                                                            setSponsors(newSponsors);
                                                        }}
                                                        className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-24 shrink-0 focus:ring-2 focus:ring-kumkum"
                                                    >
                                                        <option value="திரு">திரு</option>
                                                        <option value="திருமதி">திருமதி</option>
                                                        <option value="செல்வன்">செல்வன்</option>
                                                        <option value="செல்வி">செல்வி</option>
                                                    </select>

                                                    <div className="flex-1">
                                                        <SafeTransliterate
                                                            renderComponent={(props) => <input {...props} />}
                                                            value={sponsor.name}
                                                            onChangeText={(text) => {
                                                                const newSponsors = [...sponsors];
                                                                newSponsors[index].name = text;
                                                                setSponsors(newSponsors);
                                                            }}
                                                            placeholder="Sponsor Name (Tanglish)"
                                                            className="w-full p-2 bg-transparent border-b border-gray-100 focus:border-kumkum outline-none text-sm"
                                                            containerClassName="w-full"
                                                        />
                                                    </div>

                                                    {sponsors.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newSponsors = sponsors.filter((_, i) => i !== index);
                                                                setSponsors(newSponsors);
                                                            }}
                                                            className="text-red-400 hover:text-red-600 p-1"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="text-xs text-center text-kumkum font-medium mt-1">+ குடும்பத்தார் (Will be appended automatically)</div>
                                        </div>
                                    </div>

                                    {/* Annadhanam Details - Show only for Shivaratri */}
                                    {poojaTitle === 'சிவராத்திரி சிறப்பு பூஜை' && (
                                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Annadhanam / Special Details</label>
                                            <SafeTransliterate
                                                value={annadhanamDetails}
                                                onChangeText={(text) => setAnnadhanamDetails(text)}
                                                placeholder="Enter Annadhanam details... (Tanglish)"
                                                rows="2"
                                                renderComponent={(props) => <textarea {...props} />}
                                                className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
                                                containerClassName="w-full"
                                            />
                                        </div>
                                    )}

                                    {/* Addresses */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sponsor Current Address</label>
                                            <SafeTransliterate
                                                value={sponsorCurrentAddress}
                                                onChangeText={(text) => setSponsorCurrentAddress(text)}
                                                placeholder="Current Address (Tanglish)"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum"
                                                containerClassName="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sponsor Permanent Address</label>
                                            <SafeTransliterate
                                                value={sponsorPermanentAddress}
                                                onChangeText={(text) => setSponsorPermanentAddress(text)}
                                                placeholder="Permanent Address (Tanglish)"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum"
                                                containerClassName="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Tamil Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tamil Date (Optional)</label>
                                        <div className="flex gap-4">
                                            <select
                                                value={tamilMonth}
                                                onChange={(e) => setTamilMonth(e.target.value)}
                                                className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum w-40"
                                            >
                                                <option value="">Select Month</option>
                                                {tamilMonths.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <select
                                                value={tamilDay}
                                                onChange={(e) => setTamilDay(e.target.value)}
                                                className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum w-20"
                                            >
                                                <option value="">Day</option>
                                                {tamilDays.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <SafeTransliterate
                                        value={poojaDescription}
                                        onChangeText={(text) => setPoojaDescription(text)}
                                        rows="3"
                                        renderComponent={(props) => <textarea {...props} />}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum"
                                        placeholder="Additional Description... (Tanglish)"
                                        containerClassName="w-full"
                                    />

                                    <div className="pt-4 flex items-center justify-between">
                                        <p className={`font-medium ${poojaStatus.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{poojaStatus}</p>
                                        <button type="submit" className={`${poojaEditingId ? 'bg-blue-600' : 'bg-kumkum'} text-white px-10 py-3 rounded-xl font-bold hover:shadow-lg transition-all`}>
                                            {poojaEditingId ? 'Update Pooja' : 'Schedule Pooja'}
                                        </button>
                                    </div>
                                </form>

                                <div className="space-y-8">
                                    {/* Helper function format time */}
                                    {(() => {
                                        // Helper functions inside render scope for simplicity or just inline logic
                                        const formatTime = (time24) => {
                                            if (!time24) return '';
                                            const [hours, minutes] = time24.split(':');
                                            const h = parseInt(hours, 10);
                                            const m = parseInt(minutes, 10);
                                            const suffix = h >= 12 ? 'PM' : 'AM';
                                            const formattedHour = h % 12 || 12;
                                            return `${formattedHour}:${minutes} ${suffix}`;
                                        };

                                        const today = new Date().toISOString().split('T')[0];
                                        const upcomingPoojas = poojas.filter(p => p.date >= today);
                                        const pastPoojas = poojas.filter(p => p.date < today);

                                        const renderPoojaCard = (pooja) => (
                                            <div key={pooja.id} className={`p-5 rounded-2xl border transition-all relative ${poojaEditingId === pooja.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-md'}`}>
                                                <div className="absolute top-4 right-4 flex gap-2">
                                                    <button onClick={() => handleEditPooja(pooja)} className="text-blue-500 hover:bg-blue-100 p-2 rounded-lg"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDeletePooja(pooja.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
                                                <h3 className="font-bold text-lg text-kumkum mb-2">{pooja.title}</h3>
                                                <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                                                    <span className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-orange-400" />
                                                        {pooja.date} ({pooja.tamilMonthDate})
                                                        <span className="text-[10px] text-gray-300 ml-1 font-mono">ID: {pooja.id.slice(0, 4)}...</span>
                                                    </span>
                                                    <span className="flex items-center gap-2"><Clock size={14} className="text-orange-400" /> {formatTime(pooja.time)}</span>

                                                    {/* Condition to show Annadhanam or Sponsor */}
                                                    {pooja.title === 'சிவராத்திரி சிறப்பு பூஜை' && pooja.annadhanamDetails ? (
                                                        <span className="md:col-span-2 flex items-start gap-2 bg-yellow-50 p-2 rounded border border-yellow-100 mt-2">
                                                            <User size={14} className="text-yellow-600 mt-1 shrink-0" />
                                                            <div>
                                                                <span className="block font-bold text-xs text-yellow-800">Special / Annadhanam:</span>
                                                                <span className="text-gray-700 whitespace-pre-wrap">{pooja.annadhanamDetails}</span>
                                                            </div>
                                                        </span>
                                                    ) : (
                                                        <span className="md:col-span-2 flex items-center gap-2 font-medium">
                                                            <User size={14} className="text-orange-400" />
                                                            <span>{pooja.sponsor} {pooja.sponsor2 && `& ${pooja.sponsor2}`}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );

                                        return (
                                            <>
                                                <div>
                                                    <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100 pb-2 mb-4">Upcoming Schedule</h4>
                                                    {upcomingPoojas.length === 0 ? <p className="text-gray-400 text-center py-6 bg-gray-50 rounded-xl">No upcoming poojas.</p> : (
                                                        <div className="space-y-8">
                                                            {(() => {
                                                                // Group by Tamil Month + Year
                                                                const grouped = {};
                                                                upcomingPoojas.forEach(pooja => {
                                                                    const monthName = pooja.tamilMonthDate ? pooja.tamilMonthDate.split(' ')[0] : 'General';
                                                                    const year = pooja.date.split('-')[0];
                                                                    const key = monthName === 'General' ? 'General' : `${monthName}|${year}`;

                                                                    if (!grouped[key]) grouped[key] = [];
                                                                    grouped[key].push(pooja);
                                                                });

                                                                return Object.keys(grouped).map(key => {
                                                                    const [month, year] = key.split('|');
                                                                    return (
                                                                        <div key={key}>
                                                                            <h5 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                                                                                <span className="w-2 h-2 rounded-full bg-kumkum"></span>
                                                                                {month === 'General' ? 'General' : `${month} மாதம் ${year}`}
                                                                            </h5>
                                                                            <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-orange-50">
                                                                                {grouped[key].map(renderPoojaCard)}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>

                                                {pastPoojas.length > 0 && (
                                                    <div className="opacity-75">
                                                        <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100 pb-2 mb-4">Completed Poojas</h4>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {pastPoojas.map(renderPoojaCard)}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- COMMITTEE TAB --- */}
                    {activeTab === 'committee' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
                                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                                    <Users className="text-kumkum" size={24} />
                                    Temple Committee Members
                                </h3>
                            </div>

                            <div className="p-8">
                                <form onSubmit={handleSaveMember} className="space-y-6 mb-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Member Name</label>
                                            <SafeTransliterate
                                                value={memberName}
                                                onChangeText={(text) => setMemberName(text)}
                                                placeholder="Name (Tanglish)"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum"
                                                containerClassName="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Role (e.g. தலைவா்)</label>
                                            <SafeTransliterate
                                                value={memberRole}
                                                onChangeText={(text) => setMemberRole(text)}
                                                placeholder="Role (Tanglish)"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum"
                                                containerClassName="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Native Place / Location</label>
                                            <SafeTransliterate
                                                value={memberLocation}
                                                onChangeText={(text) => setMemberLocation(text)}
                                                placeholder="Place (Tanglish)"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum"
                                                containerClassName="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={memberPhone}
                                                onChange={(e) => setMemberPhone(e.target.value)}
                                                placeholder="Mobile Number"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kumkum"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <p className={`font-medium ${committeeStatus.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{committeeStatus}</p>
                                        <button type="submit" className="bg-kumkum text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2">
                                            <Users size={18} /> Add Member
                                        </button>
                                    </div>
                                </form>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100 pb-2">Current Committee Members</h4>
                                    {committeeMembers.length === 0 ? <p className="text-gray-400 text-center py-6">No members added yet.</p> : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {committeeMembers.map(member => (
                                                <div key={member.id} className="p-5 rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-md transition-all relative flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                                                        <p className="text-kumkum font-semibold text-sm mb-1">{member.role}</p>
                                                        <div className="text-sm text-gray-600 space-y-0.5">
                                                            <p className="flex items-center gap-2"><MapPin size={12} /> {member.location}</p>
                                                            {member.phone && <p className="flex items-center gap-2 font-mono text-xs bg-gray-50 px-2 py-0.5 rounded w-fit">{member.phone}</p>}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleDeleteMember(member.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Custom Delete Confirmation Modal */}
                    {deleteConfirmation.show && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all scale-100 border border-red-100">
                                <div className="flex items-center gap-3 mb-4 text-red-600">
                                    <div className="bg-red-50 p-3 rounded-full">
                                        <Trash2 size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
                                </div>

                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Are you sure you want to delete this {deleteConfirmation.type}? <br />
                                    <span className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-500 mt-2 block w-fit">ID: {deleteConfirmation.id}</span>
                                </p>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setDeleteConfirmation({ show: false, id: null, type: null, isLoading: false })}
                                        disabled={deleteConfirmation.isLoading}
                                        className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={deleteConfirmation.isLoading}
                                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                                    >
                                        {deleteConfirmation.isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                                <span>Deleting...</span>
                                            </>
                                        ) : (
                                            "Yes, Delete It"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Login Form (Strictly Sign In Only)
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">நிர்வாகிகள் பக்கம்</h1>
                <p className="text-gray-600 mb-6">உள்ளே நுழைய கடவுச்சொல் தேவை.</p>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleAuth}>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kumkum focus:border-transparent outline-none"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kumkum focus:border-transparent outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-kumkum text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Login'}
                    </button>

                    {/* Registration Removed: Only authorized users can login */}
                    <div className="text-sm text-gray-400 mt-4">
                        Authorized Personnel Only
                    </div>
                </form>
            </div>
        </div>
    );
}
