/** Format a year number to display string */
export const formatYear = (year) => String(year);

/** Sort an array of song objects by year ascending */
export const sortByYear = (songs) => [...songs].sort((a, b) => a.year - b.year);

/** Find the correct insertion index for a song in a sorted timeline */
export const correctIndex = (timeline, song) => {
  const idx = timeline.findIndex((s) => s.year > song.year);
  return idx === -1 ? timeline.length : idx;
};

/** Capitalise first letter of a string */
export const capitalize = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1);

/** Truncate a string to maxLen characters */
export const truncate = (str = '', maxLen = 30) =>
  str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;

export const getPlaylist = ( title ) => {
  const playlisList = {
    "Top 100 Al times": "6tAdMSXECJTIWWP4GVpn83",
    "Ukrainian Songs": "1InkWO5fnA7rMZJXCc6s7S",
    "Top most streamed": "5ABHKGoOzxkaa28ttQV9sE",
    "Top 90's": "4WsA2wYoXFkXaha0VofrPd",
  }

  return playlisList[title] || null;
}


