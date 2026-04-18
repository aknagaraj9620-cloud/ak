<div class="space-y-12">
    <div class="clay-card p-8 flex justify-between items-center bg-black/40">
        <h3 class="text-2xl font-black uppercase tracking-widest italic">Archive Browser</h3>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <?php
        $stmt = $pdo->query("SELECT * FROM movies");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo '<a href="index.php?page=movie-details&id='.$row['id'].'" class="clay-card p-2 block hover:border-accent/40 transition-colors bg-[rgba(255,255,255,0.01)]">';
            echo '<img src="'.htmlspecialchars($row['poster']).'" class="w-full aspect-[2/3] object-cover rounded-xl mb-4">';
            echo '<div class="p-2"><h4 class="font-bold text-[10px] uppercase truncate italic text-white">'.htmlspecialchars($row['title']).'</h4>';
            echo '<p class="text-[8px] opacity-40 uppercase text-white">'.htmlspecialchars($row['genre']).'</p></div></a>';
        }
        ?>
    </div>
</div>
