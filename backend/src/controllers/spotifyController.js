const SpotifyService = require("../services/spotifyService");

class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const spotifySearch = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    throw new AppError("Missing query", 400);
  }

  const results = await SpotifyService.search(q);

  if (!results) {
    throw new AppError("No results found", 404);
  }

  res.json(results);
};

const spotifyArtist = async (req, res) => {
  const artist = await SpotifyService.getArtist(req.params.id);
  if (!artist) {
    throw new AppError("Artist not found", 404);
  }
  res.json(artist);
};

const spotifyArtistTopTracks = async (req, res) => {
  const tracks = await SpotifyService.getTopTracks(req.params.id);
  if (!tracks) {
    throw new AppError("Top tracks not found", 404);
  }
  res.json(tracks);
};

const spotifyArtistAlbums = async (req, res) => {
  const albums = await SpotifyService.getAlbums(req.params.id);
  if (!albums) {
    throw new AppError("Albums not found", 404);
  }
  res.json(albums);
};

const spotifyPlaylist = async (req, res) => {
  const randomList = await SpotifyService.getSpotifyPlaylist(req.params.playlist);
  if (!randomList) {
    throw new AppError("Playlist not found", 404);
  }
  res.json(randomList);
};

module.exports = {
  spotifySearch,
  spotifyArtist,
  spotifyArtistTopTracks,
  spotifyArtistAlbums,
  spotifyPlaylist,
};
