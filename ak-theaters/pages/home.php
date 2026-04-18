<div class="space-y-12">
    <!-- Hero Section -->
    <div class="relative h-[60vh] rounded-[40px] overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
        <img src="https://image.tmdb.org/t/p/original/21pXfE40X0uT8QExdclXv7d9pZ3.jpg" class="w-full h-full object-cover">
        <div class="absolute bottom-12 left-6 md:left-12 z-20 space-y-4">
            <span class="px-4 py-1 text-[8px] font-black uppercase tracking-widest text-accent bg-accent/10 border border-accent/20 rounded-full">AK THEATERS PRESENTS</span>
            <h2 class="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">KALKI 2898 AD</h2>
            <div class="flex gap-4 pt-4">
                <a href="index.php?page=movie-details&id=1" class="px-12 py-4 text-xs font-bold uppercase tracking-widest bg-accent text-black rounded-lg">Book Now</a>
            </div>
        </div>
    </div>

    <!-- Now Showing -->
    <div class="space-y-6">
        <h3 class="text-3xl font-black uppercase italic underline decoration-accent/40 underline-offset-8">Hot Hits</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <?php
            $stmt = $pdo->query("SELECT * FROM movies WHERE status = 'now_showing' LIMIT 6");
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                echo '<a href="index.php?page=movie-details&id='.$row['id'].'" class="clay-card p-2 group cursor-pointer block hover:border-accent/40 transition-colors bg-[rgba(255,255,255,0.01)]">';
                echo '<img src="'.htmlspecialchars($row['poster']).'" class="w-full aspect-[2/3] object-cover rounded-xl mb-4">';
                echo '<div class="p-2"><h4 class="font-bold text-[10px] uppercase truncate italic text-white">'.htmlspecialchars($row['title']).'</h4>';
                echo '<p class="text-[8px] opacity-40 uppercase text-white">'.htmlspecialchars($row['genre']).'</p></div></a>';
            }
            ?>
        </div>
    </div>
</div>
