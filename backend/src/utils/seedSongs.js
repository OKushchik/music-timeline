require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('../models/Song');
const DeezerService = require('../services/deezerService');
const SpotifyService = require('../services/spotifyService');

/**
 * Song list — title + artist + year + genre.
 * audioUrl and coverUrl are enriched from the active MUSIC_PROVIDER at seed time.
 */
const songList = [
  // 1950s
  { title: 'Johnny B. Goode',              artist: 'Chuck Berry',               year: 1958, genre: 'Rock & Roll' },
  { title: 'Hound Dog',                    artist: 'Elvis Presley',              year: 1956, genre: 'Rock & Roll' },
  { title: 'Great Balls of Fire',          artist: 'Jerry Lee Lewis',            year: 1957, genre: 'Rock & Roll' },
  // 1960s
  { title: 'Hey Jude',                     artist: 'The Beatles',                year: 1968, genre: 'Rock' },
  { title: 'Like a Rolling Stone',         artist: 'Bob Dylan',                  year: 1965, genre: 'Folk Rock' },
  { title: 'Respect',                      artist: 'Aretha Franklin',            year: 1967, genre: 'Soul' },
  { title: 'Purple Haze',                  artist: 'Jimi Hendrix',               year: 1967, genre: 'Psychedelic' },
  // 1970s
  { title: 'Superstition',                 artist: 'Stevie Wonder',              year: 1972, genre: 'R&B' },
  { title: 'Bohemian Rhapsody',            artist: 'Queen',                      year: 1975, genre: 'Rock' },
  { title: 'Hotel California',             artist: 'Eagles',                     year: 1977, genre: 'Rock' },
  { title: "Stayin' Alive",                artist: 'Bee Gees',                   year: 1977, genre: 'Disco' },
  { title: 'Dreams',                       artist: 'Fleetwood Mac',              year: 1977, genre: 'Soft Rock' },
  { title: 'Le Freak',                     artist: 'Chic',                       year: 1978, genre: 'Disco' },
  // 1980s
  { title: 'Billie Jean',                  artist: 'Michael Jackson',            year: 1982, genre: 'Pop' },
  { title: "Sweet Child O' Mine",          artist: "Guns N' Roses",              year: 1987, genre: 'Rock' },
  { title: 'Like a Prayer',                artist: 'Madonna',                    year: 1989, genre: 'Pop' },
  { title: "Don't You (Forget About Me)",  artist: 'Simple Minds',               year: 1985, genre: 'New Wave' },
  { title: 'Take On Me',                   artist: 'a-ha',                       year: 1985, genre: 'Synth-pop' },
  { title: 'Every Breath You Take',        artist: 'The Police',                 year: 1983, genre: 'New Wave' },
  { title: 'With or Without You',          artist: 'U2',                         year: 1987, genre: 'Rock' },
  // 1990s
  { title: 'Losing My Religion',           artist: 'R.E.M.',                     year: 1991, genre: 'Alternative' },
  { title: 'Smells Like Teen Spirit',      artist: 'Nirvana',                    year: 1991, genre: 'Grunge' },
  { title: 'Wonderwall',                   artist: 'Oasis',                      year: 1995, genre: 'Britpop' },
  { title: 'Bitter Sweet Symphony',        artist: 'The Verve',                  year: 1997, genre: 'Alternative' },
  { title: 'Baby One More Time',           artist: 'Britney Spears',             year: 1998, genre: 'Pop' },
  { title: 'No Scrubs',                    artist: 'TLC',                        year: 1999, genre: 'R&B' },
  { title: 'Creep',                        artist: 'Radiohead',                  year: 1992, genre: 'Alternative' },
  { title: 'Say My Name',                  artist: "Destiny's Child",            year: 1999, genre: 'R&B' },
  // 2000s
  { title: 'Crazy in Love',               artist: 'Beyoncé',                    year: 2003, genre: 'R&B' },
  { title: 'Yeah!',                        artist: 'Usher',                      year: 2004, genre: 'R&B' },
  { title: 'Umbrella',                     artist: 'Rihanna',                    year: 2007, genre: 'Pop' },
  { title: 'Beautiful Day',               artist: 'U2',                         year: 2000, genre: 'Rock' },
  { title: 'Lose Yourself',               artist: 'Eminem',                     year: 2002, genre: 'Hip-Hop' },
  { title: 'Mr. Brightside',              artist: 'The Killers',                year: 2003, genre: 'Indie Rock' },
  { title: 'Hey Ya!',                      artist: 'OutKast',                    year: 2003, genre: 'Hip-Hop' },
  { title: 'Toxic',                        artist: 'Britney Spears',             year: 2004, genre: 'Pop' },
  // 2010s
  { title: 'Rolling in the Deep',         artist: 'Adele',                      year: 2010, genre: 'Soul' },
  { title: 'Shape of You',                artist: 'Ed Sheeran',                 year: 2017, genre: 'Pop' },
  { title: 'Uptown Funk',                 artist: 'Mark Ronson ft. Bruno Mars', year: 2014, genre: 'Funk' },
  { title: 'Happy',                        artist: 'Pharrell Williams',          year: 2013, genre: 'Pop' },
  { title: 'Someone Like You',            artist: 'Adele',                      year: 2011, genre: 'Soul' },
  { title: 'Old Town Road',               artist: 'Lil Nas X',                  year: 2019, genre: 'Country Rap' },
  { title: "God's Plan",                  artist: 'Drake',                      year: 2018, genre: 'Hip-Hop' },
  { title: 'Shallow',                      artist: 'Lady Gaga',                  year: 2018, genre: 'Pop' },
  // 2020s
  { title: 'Blinding Lights',             artist: 'The Weeknd',                 year: 2019, genre: 'Synth-pop' },
  { title: 'Levitating',                  artist: 'Dua Lipa',                   year: 2020, genre: 'Pop' },
  { title: 'drivers license',             artist: 'Olivia Rodrigo',             year: 2021, genre: 'Pop' },
  { title: 'As It Was',                   artist: 'Harry Styles',               year: 2022, genre: 'Pop' },
  { title: 'Flowers',                     artist: 'Miley Cyrus',                year: 2023, genre: 'Pop' },
  { title: 'Kill Bill',                   artist: 'SZA',                        year: 2022, genre: 'R&B' },
  { title: 'Anti-Hero',                   artist: 'Taylor Swift',               year: 2022, genre: 'Pop' },
  { title: 'Cruel Summer',               artist: 'Taylor Swift',               year: 2019, genre: 'Pop' },
];

async function enrichWithDeezer(song) {
  console.log('song', song)
  try {
    const result = await DeezerService.findPreviewUrl(song.title, song.artist);
    if (result?.previewUrl) {
      return {
        ...song,
        audioUrl: result.previewUrl,
        coverUrl: result.coverUrl || '',
        deezerId: result.deezerId,
      };
    }
  } catch (err) {
    console.warn(`  ⚠ Deezer lookup failed for "${song.title}": ${err.message}`);
  }
  return { ...song, audioUrl: '', coverUrl: '' };
}

async function enrichWithSpotify(song) {
  try {
    const result = await SpotifyService.findPreviewUrl(song.title, song.artist);
    if (result) {
      return {
        ...song,
        audioUrl: result.previewUrl || '',
        coverUrl: result.coverUrl || '',
        spotifyId: result.spotifyId || '',
      };
    }
  } catch (err) {
    console.warn(`  ⚠ Spotify lookup failed for "${song.title}": ${err.message}`);
  }
  return { ...song, audioUrl: '', coverUrl: '' };
}

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const provider = (process.env.MUSIC_PROVIDER || 'deezer').toLowerCase();
  const enrich =
    provider === 'spotify' ? enrichWithSpotify : enrichWithDeezer;

  console.log(`🔍 Fetching ${provider} preview URLs… (this may take a moment)`);

  const enriched = [];
  for (const song of songList) {
    process.stdout.write(`  → ${song.title} by ${song.artist}… `);
    const result = await enrich(song);
    const hasAudio = !!result.audioUrl;
    console.log(hasAudio ? '✅' : '❌ no preview');
    enriched.push(result);
    await new Promise((r) => setTimeout(r, 200));
  }

  await Song.deleteMany();
  await Song.insertMany(enriched);

  const withAudio = enriched.filter((s) => s.audioUrl).length;
  console.log(`\n✅ Seeded ${enriched.length} songs (${withAudio} with audio previews via ${provider})`);
  if (provider === 'spotify' && withAudio === 0) {
    console.warn(
      '⚠ Spotify often returns null preview_url. Consider MUSIC_PROVIDER=deezer for reliable 30s clips.'
    );
  }
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
