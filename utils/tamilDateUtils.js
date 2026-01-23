/**
 * Tamil Date Utility
 * Provides an approximation of the Tamil Month and Day for a given Gregorian date.
 * 
 * Note: The Tamil calendar relies on solar transits (Sankranti). The dates are fixed relative 
 * to the sun's position, but vary slightly in the Gregorian calendar (e.g., April 14 or 15).
 * 
 * This utility uses a standard approximation where:
 * Chithirai starts ~April 14
 * Vaikasi starts ~May 15
 * ...and so on.
 */

const tamilMonths = [
    "சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி",
    "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"
];

const tamilMonthStartDates = [
    { month: "சித்திரை", startDay: 14, startMonth: 4 },   // April 14
    { month: "வைகாசி", startDay: 15, startMonth: 5 },     // May 15
    { month: "ஆனி", startDay: 15, startMonth: 6 },        // June 15
    { month: "ஆடி", startDay: 17, startMonth: 7 },        // July 17
    { month: "ஆவணி", startDay: 17, startMonth: 8 },       // Aug 17
    { month: "புரட்டாசி", startDay: 17, startMonth: 9 },  // Sep 17
    { month: "ஐப்பசி", startDay: 18, startMonth: 10 },    // Oct 18
    { month: "கார்த்திகை", startDay: 17, startMonth: 11 }, // Nov 17
    { month: "மார்கழி", startDay: 16, startMonth: 12 },   // Dec 16
    { month: "தை", startDay: 14, startMonth: 1 },         // Jan 14
    { month: "மாசி", startDay: 13, startMonth: 2 },       // Feb 13
    { month: "பங்குனி", startDay: 14, startMonth: 3 }     // Mar 14
];

/**
 * Calculates the Tamil date from a Gregorian date.
 * @param {string} dateString - YYYY-MM-DD format
 * @returns {object} { month: string, day: number } or null if invalid
 */
export const getTamilDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    // Use loop to find the current Tamil month
    // We check if the date is ON or AFTER the start date of a Tamil month.
    // Since Tamil months wrap around the year (Chithirai is first), we need to handle year shifts carefully.
    // However, a simpler way is to check the Gregorian month/day against the start dates.

    // 0-indexed month for JS Date, 1-indexed for our config
    const day = date.getDate();
    const month = date.getMonth() + 1;

    // Find the index in our config corresponding to the potential current or previous tamil month
    // We iterate backwards to find the first month that started before or on this date.

    // Sort logic needs to be circular. 
    // Let's simplfy:
    // If Month > StartMonth OR (Month === StartMonth AND Day >= StartDay) -> It is THIS Tamil Month
    // Else -> It is the PREVIOUS Tamil Month

    // Let's create a linear timeline for the *current Gregorian year*
    // But Tamil new year starts in April.

    // Logic:
    // 1. Identify which "Gregorian-based" Tamil month transition applies.
    //    e.g., If date is Jan 5, it is before Thai (Jan 14), so it must be Margazhi (Dec 16 start).
    //    If date is Jan 15, it is Thai.

    // Let's find the correct entry in `tamilMonthStartDates` that represents the *start* of the current Tamil month.

    let currentTamilMonthIndex = -1;
    let daysElapsed = 0;

    // We can iterate through the start dates.
    // We need to handle the year wrap for Jan/Feb/Mar (which belong to the cycle started in previous Gregorian year 'Chithirai')
    // except 'Thai', 'Maasi', 'Panguni' are the tail end.

    // Easier approach: Convert everything to "Day of Year" or compare linearly?
    // Let's stick to month/day compare.

    // Sort config by startMonth just to be sure (it is already)
    // Find the start date that is closest before or equal to current date.

    // Special handling for beginning of year (before Chithirai / April 14)?
    // Actually simpler: 
    // Scan all 12 transitions. Pick the one that has occurred most recently.

    /*   
       Example: 
       Feb 10: 
       Jan 14 (Thai) has passed. Feb 13 (Maasi) has NOT.
       So it is Thai.
    */

    // We need to check 'previous year Dec 16' if we are in early Jan.

    let bestMatch = null;
    let bestMatchDate = null; // As a Date object for diff calc

    // Check all 12 potential start dates *for the current Gregorian year*
    // AND check the Dec start date from *previous Gregorian year* (for early Jan)
    // AND check the Jan/Feb/Mar start dates from *next Gregorian year*? No, just current query date matters.

    const year = date.getFullYear();

    const YEAR_OVERRIDES = {
        2026: {
            "சித்திரை": 14,   // April 14
            "வைகாசி": 15,    // May 15
            "ஆனி": 15,       // June 15
            "ஆடி": 17,       // July 17
            "ஆவணி": 18,      // Aug 18
            "புரட்டாசி": 18,  // Sep 18
            "ஐப்பசி": 18,    // Oct 18
            "கார்த்திகை": 17, // Nov 17
            "மார்கழி": 16,   // Dec 16 (for Dec 2026)
            "தை": 15,        // Jan 15 (Tested)
            "மாசி": 13,      // Feb 13
            "பங்குனி": 15    // Mar 15
        }
    };

    // Generate specific start dates for this year
    const transitions = tamilMonthStartDates.map(t => {
        let day = t.startDay;
        if (YEAR_OVERRIDES[year] && YEAR_OVERRIDES[year][t.month]) {
            day = YEAR_OVERRIDES[year][t.month];
        }
        return {
            ...t,
            dateObj: new Date(year, t.startMonth - 1, day)
        };
    });

    // Add previous year's Margazhi for early Jan dates
    // Margazhi starts Dec 16 roughly
    let prevYearMargazhiDay = 16;
    if (YEAR_OVERRIDES[year - 1] && YEAR_OVERRIDES[year - 1]["மார்கழி"]) {
        prevYearMargazhiDay = YEAR_OVERRIDES[year - 1]["மார்கழி"];
    }

    transitions.push({
        month: "மார்கழி",
        startDay: prevYearMargazhiDay,
        startMonth: 12,
        dateObj: new Date(year - 1, 11, prevYearMargazhiDay)
    });

    // Find the latest transition that is <= date
    // Sort absolute time desc
    transitions.sort((a, b) => b.dateObj - a.dateObj);

    for (const t of transitions) {
        if (date >= t.dateObj) {
            bestMatch = t;
            bestMatchDate = t.dateObj;
            break;
        }
    }

    if (!bestMatch) {
        // Should not happen if we covered enough history (prev year Dec)
        return null;
    }

    // Clear time components for accurate day difference
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(bestMatchDate.getFullYear(), bestMatchDate.getMonth(), bestMatchDate.getDate());

    const diffTime = d1 - d2;
    // Rounding to handle potential daylight saving offsets or small glitches, 
    // though clear time above handles most.
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Day 1 = start date. so if diffDays is 0, it is day 1.
    const tamilDay = diffDays + 1;

    // Cap at 32 just in case logic goes wild, though Tamil months are max 32.
    if (tamilDay > 32) {
        // Fallback or edge case?
        // Usually means we missed a transition?
        // e.g. leap year or shift.
        // For now, accept it, user can edit.
    }

    return {
        month: bestMatch.month,
        day: tamilDay
    };
};
