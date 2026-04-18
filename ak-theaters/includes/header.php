<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AK Theaters (PHP Archive)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background-color: #050505; color: #E0E0E0; margin: 0; padding: 0; overflow-x: hidden; }
        .clay-card { 
            background: rgba(255,255,255,0.02); 
            border-radius: 20px; 
            border: 1px solid rgba(255,255,255,0.05); 
        }
        .text-accent { color: #FF4E00; }
        .bg-accent { background-color: #FF4E00; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="pb-24">

    <!-- NAV BAR -->
    <nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl" style="background: rgba(5,5,5,0.8); backdrop-filter: blur(10px);">
        <a href="index.php?page=home" class="flex items-center gap-2">
            <div class="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.4-2.2 1.5-2.5l13.5-4c1.1-.3 2.2.4 2.5 1.5l.6 2.4z"/><path d="m2 13 18.2-4.4c.5-.1 1 .2 1.1.7l1.3 5.4c.1.5-.2 1-.7 1.1L3.7 20.2c-.5.1-1-.2-1.1-.7L1.3 14c-.1-.5.2-1 .7-1.1z"/></svg>
            </div>
            <h1 class="text-xl font-extrabold tracking-tighter text-white">AK THEATERS</h1>
        </a>

        <div class="hidden md:flex gap-4">
            <a href="index.php?page=home" class="text-[10px] uppercase font-black tracking-widest px-4 py-2 hover:text-accent <?php echo ($page=='home') ? 'text-accent border-b-2 border-accent' : 'opacity-60'; ?>">HOME</a>
            <a href="index.php?page=movies" class="text-[10px] uppercase font-black tracking-widest px-4 py-2 hover:text-accent <?php echo ($page=='movies') ? 'text-accent border-b-2 border-accent' : 'opacity-60'; ?>">MOVIES</a>
            
            <?php if(isset($_SESSION['user_id'])): ?>
                <a href="index.php?page=profile" class="text-[10px] uppercase font-black tracking-widest px-4 py-2 hover:text-accent <?php echo ($page=='profile') ? 'text-accent border-b-2 border-accent' : 'opacity-60'; ?>">PROFILE</a>
                <a href="api/logout.php" class="text-[10px] uppercase font-black tracking-widest px-4 py-2 text-red-500 hover:text-red-400">LOGOUT</a>
            <?php else: ?>
                <a href="index.php?page=login" class="text-[10px] uppercase font-black tracking-widest px-4 py-2 hover:text-accent <?php echo ($page=='login') ? 'text-accent border-b-2 border-accent' : 'opacity-60'; ?>">LOGIN</a>
            <?php endif; ?>
        </div>
    </nav>

    <!-- MAIN CONTENT PADDING -->
    <main class="pt-24 max-w-7xl mx-auto px-4">
