import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// For SPA preview, serve index.html for all non-api routes
app.use(express.static('.'));

// Mock API for Preview
const movies = [
    { id: 101, title: 'The GOAT', poster: 'https://picsum.photos/seed/goat/400/600', banner: 'https://picsum.photos/seed/goatb/1920/600', rating: 8.4, genre: 'Action/Sci-Fi', language: 'Tamil', duration: 170, status: 'now_showing', trailer_url: 'https://www.youtube.com/embed/9w_0V_rO1xk' },
    { id: 102, title: 'Leo', poster: 'https://picsum.photos/seed/leo/400/600', banner: 'https://picsum.photos/seed/leob/1920/600', rating: 8.5, genre: 'Crime/Action', language: 'Tamil', duration: 164, status: 'now_showing', trailer_url: 'https://www.youtube.com/embed/Po3jJhK6_fY' },
    { id: 103, title: 'Salaar', poster: 'https://picsum.photos/seed/salaar/400/600', banner: 'https://picsum.photos/seed/salaarb/1920/600', rating: 8.3, genre: 'Action', language: 'Telugu', duration: 175, status: 'now_showing', trailer_url: 'https://www.youtube.com/embed/4GPvYV_shG4' },
    { id: 104, title: 'Kanguva', poster: 'https://picsum.photos/seed/kanguva/400/600', banner: 'https://picsum.photos/seed/kanguvab/1920/600', rating: 8.7, genre: 'Fantasy', language: 'Tamil', duration: 155, status: 'now_showing', trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 105, title: 'Vidaamuyarchi', poster: 'https://picsum.photos/seed/ajithv/400/600', banner: 'https://picsum.photos/seed/ajithvb/1920/600', rating: 8.2, genre: 'Thriller', language: 'Tamil', duration: 160, status: 'now_showing', trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
];

// Procedural generation to reach 200+ movies for preview
for (let i = 1; i <= 200; i++) {
    movies.push({
        id: 200 + i,
        title: `South Legend Vol ${i}`,
        poster: `https://picsum.photos/seed/p${i}/400/600`,
        banner: `https://picsum.photos/seed/b${i}/1920/600`,
        rating: (6 + (i % 4)),
        genre: ['Action', 'Drama', 'Thriller', 'Sci-Fi'][i % 4],
        language: ['Tamil', 'Telugu', 'Malayalam'][i % 3],
        duration: 120 + (i % 60),
        status: i % 10 === 0 ? 'coming_soon' : 'now_showing',
        trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    });
}

app.get('/api/movies', (req, res) => {
    const status = req.query.status || 'now_showing';
    const limit = parseInt(req.query.limit as string) || 200;
    const filtered = movies.filter(m => m.status === status);
    res.json(filtered.slice(0, limit));
});

app.get('/api/movies/details', (req, res) => {
    const id = parseInt(req.query.id as string);
    const movie = movies.find(m => m.id === id) || movies[0];
    res.json({
        ...movie,
        description: 'Mock description for the theater system.',
        cast: [{ name: 'Prabhas', character_name: 'Bhairava', image: 'https://picsum.photos/seed/p1/200/200' }],
        crew: [{ name: 'Nag Ashwin', role: 'Director', image: 'https://picsum.photos/seed/n1/200/200' }]
    });
});

app.get('/api/shows', (req, res) => {
    res.json([
        { id: 1, movie_id: 1, theater_name: 'AK Cinemas', location: 'Guntur', show_time: '11:00 AM' },
        { id: 2, movie_id: 1, theater_name: 'AK Cinemas', location: 'Guntur', show_time: '02:45 PM' }
    ]);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`AK THEATERS Preview running at http://localhost:${PORT}`);
});
