await (async () => {
    const balanceCoins = await useNuxtApp().$pinia._s.get('clicker')
        .balanceCoins;

    /** @type Array */
    const upgrades = await useNuxtApp()
        .$pinia._s.get('upgrade')
        .upgradesForBuy.filter(
            (u) => u.isAvailable && u.profitPerHour > 0 && !u.isExpired
        )
        .sort(
            (a, b) =>
                a.profitPerHourDelta / a.price - b.profitPerHourDelta / b.price
        )
        .map((u) => {
            const {
                name,
                section,
                price,
                profitPerHourDelta,
                cooldownSeconds,
                id
            } = u;
            return {
                name,
                section,
                price,
                profitPerHourDelta,
                cooldownSeconds,
                id
            };
        })
        .reverse();
    console.log('upgrades', upgrades);

    const bestIndex = upgrades.findIndex(
        (u) => !u.cooldownSeconds && u.price < balanceCoins
    );
    const best = upgrades[bestIndex];
    console.log(`best (${bestIndex})`, best);

    await useNuxtApp().$pinia._s.get('upgrade').postBuyUpgrade(best.id);
})();
