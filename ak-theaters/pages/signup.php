<div class="max-w-md mx-auto pt-20">
    <div class="clay-card p-10 space-y-8 text-center bg-black/60 border border-white/5 shadow-2xl">
        <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,78,0,0.3)]">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4E00" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm10 4v6M22 14h-6"/></svg>
        </div>
        <div>
            <h2 class="text-3xl font-black italic uppercase text-white">Create Node</h2>
            <p class="text-[10px] uppercase font-black tracking-widest opacity-40 mt-2">Initialize Local Database Identity</p>
        </div>
        
        <form action="api/signup.php" method="POST" class="space-y-6 text-left">
            <div>
                <label class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">Display Name</label>
                <input type="text" name="name" required class="w-full bg-black/80 border border-white/10 rounded-xl p-4 outline-none focus:border-accent text-sm text-white hover:bg-white/5 transition-colors">
            </div>
            <div>
                <label class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">Comms Link (Email)</label>
                <input type="email" name="email" required class="w-full bg-black/80 border border-white/10 rounded-xl p-4 outline-none focus:border-accent text-sm text-white hover:bg-white/5 transition-colors">
            </div>
            <div>
                <label class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">Security Key (Password)</label>
                <input type="password" name="password" required class="w-full bg-black/80 border border-white/10 rounded-xl p-4 outline-none focus:border-accent text-sm text-white hover:bg-white/5 transition-colors">
            </div>
            <button type="submit" class="w-full bg-accent text-black font-black uppercase tracking-[0.2em] py-4 rounded-xl mt-4 hover:opacity-80 transition-opacity">Deploy Identity</button>
        </form>
        <div class="pt-4 border-t border-white/10">
            <p class="text-[10px] font-bold uppercase tracking-widest opacity-60">Already registered? <br><br> <a href="index.php?page=login" class="text-accent underline hover:opacity-80 transition-opacity">Login</a></p>
        </div>
    </div>
</div>
