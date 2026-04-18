<?php
require_once 'includes/auth.php';
require_login();

$movie_id = $_GET['movie'] ?? 1;
$time = $_GET['time'] ?? '11:00 AM';

$stmt = $pdo->prepare("SELECT title FROM movies WHERE id = ?");
$stmt->execute([$movie_id]);
$movie = $stmt->fetch(PDO::FETCH_ASSOC);
$title = $movie ? $movie['title'] : 'Unknown Selection';
?>
<div class="pt-10 max-w-4xl mx-auto space-y-10 pb-20">
    <div class="text-center space-y-2">
        <h2 class="text-4xl font-black uppercase italic tracking-tighter text-white">Seat Selection</h2>
        <p class="text-xs uppercase font-black opacity-40 tracking-widest">AK CINEMAS GUNTUR • <span class="text-accent"><?php echo htmlspecialchars($title); ?></span> • <?php echo htmlspecialchars($time); ?></p>
    </div>
    
    <div class="text-center">
        <div class="w-full h-2 bg-gradient-to-r from-transparent via-accent/40 to-transparent rounded-full mb-4 shadow-[0_0_20px_rgba(255,78,0,0.3)]"></div>
        <p class="text-[10px] font-black uppercase tracking-[1em] opacity-40">CINEMATIC SCREEN</p>
    </div>
    
    <form action="api/book-ticket.php" method="POST" class="bg-[rgba(255,255,255,0.02)] p-10 rounded-[30px] border border-white/5 space-y-10 clay-card">
        <input type="hidden" name="movie_title" value="<?php echo htmlspecialchars($title); ?>">
        <input type="hidden" name="show_time" value="<?php echo htmlspecialchars($time); ?>">
        
        <div class="grid grid-cols-10 gap-3 justify-center max-w-2xl mx-auto">
            <?php for($i=1; $i<=60; $i++): ?>
                <label class="cursor-pointer flex items-center justify-center">
                    <input type="checkbox" name="seats[]" value="S<?php echo $i; ?>" class="hidden peer">
                    <div class="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] border border-white/10 flex items-center justify-center text-[8px] font-black peer-checked:bg-accent peer-checked:text-black peer-checked:border-accent hover:bg-[rgba(255,255,255,0.2)] transition-all">
                        S<?php echo $i; ?>
                    </div>
                </label>
            <?php endfor; ?>
        </div>
        
        <div class="text-center pt-10 border-t border-white/10">
            <button type="submit" class="bg-accent text-black px-12 py-4 rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,78,0,0.4)] hover:scale-105 transition-transform">
                Confirm Booking Logic
            </button>
        </div>
    </form>
</div>
