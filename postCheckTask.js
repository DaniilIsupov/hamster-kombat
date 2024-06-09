await useNuxtApp()
    .$pinia._s.get('earn')
    .postCheckTask(
        await useNuxtApp()
            .$pinia._s.get('earn')
            .tasks.filter((t) => !t.isCompleted)[0].id
    );
