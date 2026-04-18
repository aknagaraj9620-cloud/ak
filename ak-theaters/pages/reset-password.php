<div class="max-w-md mx-auto pt-20 pb-20">
    <div class="clay-card p-10 space-y-8 text-center bg-black/60 border border-white/5 shadow-2xl">
        <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,78,0,0.3)]">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4E00" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div>
            <h2 class="text-3xl font-black italic uppercase text-white">Grid Reset</h2>
            <p class="text-[10px] uppercase font-black tracking-widest opacity-40 mt-2">Password Recovery Module</p>
        </div>
        
        <form action="#" method="POST" class="space-y-6 text-left" onsubmit="event.preventDefault(); alert('Reset link simulated! (PHP Mailer requires active SMTP server to execute real logic).');">
            <div>
                <label class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">Comms Link (Registered Email)</label>
                <input type="email" name="email" required class="w-full bg-black/80 border border-white/10 rounded-xl p-4 outline-none focus:border-accent text-sm text-white hover:bg-white/5 transition-colors">
            </div>
            
            <button type="submit" class="w-full bg-white/10 border border-white/20 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl mt-4 hover:bg-white/20 transition-all">Transmit Override Key</button>
        </form>
        <div class="pt-4 border-t border-white/10">
            <p class="text-[10px] font-bold uppercase tracking-widest opacity-60"><a href="index.php?page=login" class="text-accent underline hover:opacity-80 transition-opacity">Abort to Login</a></p>
        </div>
    </div>
</div>
