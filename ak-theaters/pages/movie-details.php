<?php
$id = $_GET['id'] ?? 1;
$stmt = $pdo->prepare("SELECT * FROM movies WHERE id = ?");
$stmt->execute([$id]);
$movie = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$movie) { 
    echo "<div class='text-center py-20 text-accent font-bold'>Movie not found in archive.</div>"; 
    exit; 
}
?>
<div class="grid md:grid-cols-12 gap-12 items-start pt-10">
    <div class="md:col-span-4 lg:col-span-3">
        <div class="clay-card p-2">
            <img src="<?php echo htmlspecialchars($movie['poster']); ?>" class="w-full rounded-2xl aspect-[2/3] object-cover">
        </div>
    </div>
    
    <div class="md:col-span-8 lg:col-span-9 space-y-8 pt-4">
        <div>
            <span class="text-accent font-black text-xs uppercase tracking-[0.2em]">NOW SCREENING</span>
            <h1 class="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-white"><?php echo htmlspecialchars($movie['title']); ?></h1>
            <p class="opacity-40 text-xs font-bold uppercase tracking-[0.1em] mt-2">
                <?php echo htmlspecialchars($movie['language']); ?> • <?php echo htmlspecialchars($movie['duration']); ?>m • <?php echo htmlspecialchars($movie['genre']); ?>
            </p>
        </div>
        
        <p class="max-w-3xl text-lg leading-relaxed opacity-60 italic font-light">
            <?php echo htmlspecialchars($movie['description']); ?>
        </p>

        <div class="pt-6 border-t border-white/5 space-y-6">
            <h3 class="text-3xl font-black italic tracking-tighter uppercase">Select Timeline</h3>
            <div class="clay-card p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-[rgba(255,255,255,0.01)] border-white/5">
                <div>
                     <h4 class="text-2xl font-black italic uppercase">AK CINEMAS - GUNTUR</h4>
                     <p class="text-xs opacity-40 uppercase font-black tracking-widest">Premium Laser • Atmos 7.1</p>
                </div>
                <div class="flex gap-4 flex-wrap">
                     <a href="index.php?page=booking&movie=<?php echo $movie['id']; ?>&time=11:00 AM" class="border border-white/10 px-6 py-2 rounded-full text-xs font-black uppercase hover:border-accent hover:text-accent transition-colors">11:00 AM</a>
                     <a href="index.php?page=booking&movie=<?php echo $movie['id']; ?>&time=06:15 PM" class="border border-white/10 px-6 py-2 rounded-full text-xs font-black uppercase hover:border-accent hover:text-accent transition-colors">06:15 PM</a>
                </div>
            </div>
        </div>
    </div>
</div>
