await useNuxtApp()
    .$pinia._s.get('clicker')
    .postTap(Math.floor(Math.random() * 512));
