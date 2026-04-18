<?php
require_once 'includes/auth.php';
require_login();

$uid = $_SESSION['user_id'];
$stmt = $pdo->prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$uid]);
$bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<div class="max-w-5xl mx-auto pt-10 space-y-12">
    <div class="clay-card p-10 flex gap-8 items-center bg-black/40 border-white/5">
        <div class="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center border border-accent/40 shadow-[0_0_20px_rgba(255,78,0,0.2)]">
            <span class="text-3xl font-black text-accent uppercase"><?php echo substr($_SESSION['user_name'], 0, 1); ?></span>
        </div>
        <div>
            <h2 class="text-5xl font-black uppercase tracking-tighter text-white"><?php echo htmlspecialchars($_SESSION['user_name']); ?></h2>
            <p class="text-xs uppercase font-black opacity-40 tracking-[0.2em] mt-2"><?php echo htmlspecialchars($_SESSION['user_email']); ?></p>
        </div>
    </div>
    
    <div class="space-y-6">
        <h3 class="text-2xl font-black italic uppercase underline decoration-accent/40 underline-offset-8">Mission Logs</h3>
        <?php if (count($bookings) === 0): ?>
            <div class="clay-card p-10 text-center opacity-40 border-white/5 bg-[rgba(255,255,255,0.01)] text-xs font-bold uppercase tracking-widest">No entries found in your archive.</div>
        <?php else: ?>
            <div class="grid gap-4">
            <?php foreach($bookings as $b): ?>
                <div class="clay-card p-6 bg-black/40 flex flex-col md:flex-row justify-between items-start md:items-center border-white/5 gap-4">
                    <div>
                        <h4 class="text-xl font-black italic uppercase text-accent"><?php echo htmlspecialchars($b['movie_title']); ?></h4>
                        <p class="text-[10px] font-black uppercase opacity-40 tracking-widest mt-1">DATE: <?php echo $b['show_date']; ?> • TIME: <?php echo $b['show_time']; ?></p>
                        <p class="text-[10px] font-black uppercase mt-3">Active Seats: <span class="text-white/60"><?php echo htmlspecialchars($b['seats']); ?></span></p>
                    </div>
                    <div class="text-left md:text-right w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                        <p class="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">PNR TICKET KEY</p>
                        <p class="text-2xl font-black tracking-widest text-white mt-1"><?php echo htmlspecialchars($b['pnr']); ?></p>
                        <span class="inline-block mt-2 text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1 rounded">₹<?php echo $b['total_price']; ?></span>
                    </div>
                </div>
            <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>
