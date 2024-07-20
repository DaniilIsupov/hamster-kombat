import puppeteer, { KnownDevices } from 'puppeteer';

declare global {
    interface Window {
        useNuxtApp?: CallableFunction;
        buyUpgrade: (options?: { calculationOnly?: boolean }) => Promise<void>;
        unlockUpgrade: () => Promise<void>;
        Telegram: any;
    }
}

const Pixel5 = KnownDevices['Pixel 5'];

const browser = await puppeteer.launch({
    headless: false
});

/**
 * @example Object.entries(Telegram.WebView.initParams).map(([k, v]) => [k, encodeURIComponent(v)]).map((o) => o.join('=')).join('&');
 */
const hashes = [
    'tgWebAppData=&tgWebAppVersion=&tgWebAppPlatform=&tgWebAppThemeParams='
];

async function open(hash: string) {
    const page = await browser.newPage();
    await page.emulate(Pixel5);

    await page.goto(`https://hamsterkombatgame.io/clicker/#${hash}`);

    const _userTap = await page.waitForSelector('.user-tap').catch(console.log);

    await page.evaluate(() => {
        try {
            window.buyUpgrade = async ({ calculationOnly = false } = {}) => {
                if (!window.useNuxtApp) {
                    return;
                }

                const balanceCoins = await window
                    .useNuxtApp()
                    .$pinia._s.get('clicker').balanceCoins;

                /** @type Array */
                const upgrades = await window
                    .useNuxtApp()
                    .$pinia._s.get('upgrade')
                    .upgradesForBuy.filter(
                        (u) =>
                            u.isAvailable && u.profitPerHour > 0 && !u.isExpired
                    )
                    .sort(
                        (a, b) =>
                            a.profitPerHourDelta / a.price -
                            b.profitPerHourDelta / b.price
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

                if (calculationOnly) {
                    return;
                }

                await window
                    .useNuxtApp()
                    .$pinia._s.get('upgrade')
                    .postBuyUpgrade(best.id)
                    .then(console.log);
            };

            window.unlockUpgrade = async () => {
                if (!window.useNuxtApp) {
                    return;
                }

                const balanceCoins = await window
                    .useNuxtApp()
                    .$pinia._s.get('clicker').balanceCoins;

                /** @type Array */
                const upgradesForBuy = await window
                    .useNuxtApp()
                    .$pinia._s.get('upgrade').upgradesForBuy;
                console.log('upgradesForBuy', upgradesForBuy);

                /** @type Array */
                const upgrades = upgradesForBuy
                    .filter(
                        (u) =>
                            !u.isAvailable &&
                            !['ReferralCount', 'MoreReferralsCount'].includes(
                                u.condition?._type
                            ) &&
                            u.profitPerHour > 0 &&
                            !u.isExpired
                    )
                    .sort(
                        (a, b) =>
                            a.profitPerHourDelta / a.price -
                            b.profitPerHourDelta / b.price
                    )
                    .map((u) => {
                        return {
                            ...u
                        };
                    })
                    .reverse();
                console.log('upgrades', upgrades);

                const bestIndex = upgrades.findIndex(
                    (u) => !u.cooldownSeconds && u.price < balanceCoins
                );
                const best = upgrades[bestIndex];
                console.log(`best (${bestIndex})`, best);
            };

            const wrapper = document.createElement('div');
            wrapper.className = 'emulate-wrapper';
            wrapper.style.position = 'fixed';
            wrapper.style.top = '0';
            wrapper.style.left = '0';
            wrapper.style.zIndex = '3';
            document.body.appendChild(wrapper);

            const tapButton = document.createElement('button');
            tapButton.textContent = 'tap';
            tapButton.onclick = async () => {
                const response = await window
                    .useNuxtApp?.()
                    .$pinia._s.get('clicker')
                    .postTap(Math.floor(Math.random() * 1024));
                console.log('postTap response', response);

                if (
                    new Date(
                        response?.clickerUser.boosts.BoostFullAvailableTaps
                            .lastUpgradeAt *
                            1000 +
                            60 * 60 * 1000
                    ) < new Date() &&
                    response.clickerUser.availableTaps <
                        response.clickerUser.earnPerTap
                ) {
                    window
                        .useNuxtApp?.()
                        .$pinia._s.get('boost')
                        .postBuyBoost('BoostFullAvailableTaps')
                        .then(console.log);
                }
            };
            wrapper.appendChild(tapButton);

            const getProfitableUpgradeButton = document.createElement('button');
            getProfitableUpgradeButton.textContent = 'getProfitableUpgrade';
            getProfitableUpgradeButton.onclick = () =>
                window.buyUpgrade({ calculationOnly: true });
            wrapper.appendChild(getProfitableUpgradeButton);

            const buyUpgradeButton = document.createElement('button');
            buyUpgradeButton.textContent = 'buyUpgrade';
            buyUpgradeButton.onclick = () => window.buyUpgrade();
            wrapper.appendChild(buyUpgradeButton);

            const unlockUpgradeButton = document.createElement('button');
            unlockUpgradeButton.textContent = 'unlockUpgrade';
            unlockUpgradeButton.onclick = () => window.unlockUpgrade();
            wrapper.appendChild(unlockUpgradeButton);
        } catch (error) {
            console.log('catch', error);
        }
    });
}

for (const hash of hashes) {
    await open(hash);
}
