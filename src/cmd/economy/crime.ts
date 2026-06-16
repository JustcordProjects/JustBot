import { getRandomInt } from '@/util/math/rand.ts';

import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/apis/commands/misc.ts';
import { ReplyEmbed } from '@/bot/apis/translations/reply-embed.ts';

import Money from '@/util/money.ts';
import randomElement from '@/util/random-element.ts';

const CrimeAmountMin = 2500;
const CrimeAmountMax = 8000;
const Percentage = 0.4;
const Cooldown = 900_000;

type MessageCallback = (amount: Money) => string;
const CrimeSuccessMessages: MessageCallback[] = [
    (amount) => `Włamałeś się do automatu z napojami i znalazłeś w nim **${amount.format()}**.`,
    (amount) => `Ukradłeś komuś portfel w autobusie i znalazłeś w nim **${amount.format()}**.`,
    (amount) => `Podmieniłeś skarbonkę w sklepie i zgarnąłeś **${amount.format()}**.`,
    (amount) => `Okazało się że czyjś samochód był otwarty. W schowku znalazłeś **${amount.format()}**.`,
    (amount) => `Zrobiłeś fake giveaway na Discordzie i ktoś naprawdę wysłał ci **${amount.format()}**.`,
    (amount) => `Sprzedałeś pirackie kopie gier i zarobiłeś **${amount.format()}** zanim ktoś się zorientował.`,
    (amount) => `Zhakowałeś czyjeś WiFi i sprzedałeś hasło sąsiadom za **${amount.format()}**.`,
    (amount) => `Znalazłeś niezabezpieczoną kasę w sklepie i zgarnąłeś **${amount.format()}**.`,
    (amount) => `Ukryłeś cryptominera w czyimś komputerze i zarobiłeś **${amount.format()}**.`,
    (amount) => `Zrobiłeś phishing na Discordzie i ktoś się nabrał. Zysk **${amount.format()}**.`,
    (amount) => `Ukradłeś rower spod sklepu i sprzedałeś go za **${amount.format()}**.`,
    (amount) => `Sprzedałeś fałszywe bilety na koncert i zarobiłeś **${amount.format()}**.`,
    (amount) => `Podmieniłeś słoik z napiwkami w kawiarni i zgarnąłeś **${amount.format()}**.`,
    (amount) => `Znalazłeś niezablokowany komputer w bibliotece i przelałeś sobie **${amount.format()}**.`,
    (amount) => `Sprzedałeś losowy kabel jako "adapter do wszystkiego" za **${amount.format()}**.`,
    (amount) => `Ukradłeś hulajnogę elektryczną i sprzedałeś ją za **${amount.format()}**.`,
    (amount) => `Podszyłeś się pod support i ktoś wysłał ci **${amount.format()}**.`,
    (amount) => `Znalazłeś czyjąś zgubioną kartę podarunkową wartą **${amount.format()}**.`,
    (amount) => `Okazało się że ktoś zostawił portfel na ladzie. W środku było **${amount.format()}**.`,
    (amount) => `Sprzedałeś losowy kabel jako "adapter do wszystkiego" za **${amount.format()}**.`,
];
const CrimeFailMessages: MessageCallback[] = [
    (amount) => `Próbowałeś ukraść portfel, ale właściciel to zauważył i musiałeś oddać **${amount.format()}**.`,
    (amount) => `Chciałeś włamać się do automatu z napojami, ale przyjechała policja. Mandat **${amount.format()}**.`,
    (amount) => `Próbowałeś zrobić scam na Discordzie, ale ktoś zgłosił cię adminowi i straciłeś **${amount.format()}**.`,
    (amount) => `Ukradłeś rower, ale po 5 minutach okazało się że należy do policjanta. Strata **${amount.format()}**.`,
    (amount) => `Chciałeś sprzedać pirackie gry, ale klient okazał się policjantem. Kara **${amount.format()}**.`,
    (amount) => `Zhakowałeś WiFi sąsiada, ale zmienił hasło i musiałeś zapłacić **${amount.format()}** za szkody.`,
    (amount) => `Próbowałeś ukraść hulajnogę, ale bateria była rozładowana i złapali cię. Mandat **${amount.format()}**.`,
    (amount) => `Chciałeś zrobić phishing, ale wysłałeś linka do admina serwera. Straciłeś **${amount.format()}**.`,
    (amount) => `Próbowałeś okraść sklep, ale kamera wszystko nagrała. Kara **${amount.format()}**.`,
    (amount) => `Znalazłeś portfel, ale właściciel wrócił szybciej niż myślałeś i oddałeś **${amount.format()}**.`,
    (amount) => `Próbowałeś sprzedać fałszywe bilety, ale kupujący chciał zwrot **${amount.format()}**.`,
    (amount) => `Ukryłeś cryptominera w komputerze znajomego, ale jego antywirus znalazł go po 2 minutach. Strata **${amount.format()}**.`,
    (amount) => `Próbowałeś ukraść napiwki z kawiarni, ale barista cię złapał. Musiałeś oddać **${amount.format()}**.`,
    (amount) => `Chciałeś sprzedać kradziony rower, ale kupujący był jego właścicielem. Strata **${amount.format()}**.`,
    (amount) => `Podszyłeś się pod support, ale ktoś sprawdził profil i straciłeś **${amount.format()}**.`,
    (amount) => `Próbowałeś ukraść coś ze sklepu, ale alarm się włączył. Mandat **${amount.format()}**.`,
    (amount) => `Chciałeś oscamować kogoś na OLX, ale to on oscamował ciebie. Strata **${amount.format()}**.`,
    (amount) => `Próbowałeś włamać się do auta, ale właściciel siedział w środku. Oddałeś **${amount.format()}**.`,
    (amount) => `Chciałeś sprzedać fałszywy kabel jako "gamingowy", ale kupujący był informatykiem. Straciłeś **${amount.format()}**.`,
    (amount) => `Próbowałeś zrobić napad, ale potknąłeś się uciekając. Kara **${amount.format()}**.`,
];

const crimeCmd: Command = {
    name: 'crime',
    description: {
        main: 'Ohohohoho! Mamy na serwerze przestępców. Możesz popełnić przestępstwo i wygrać albo przegrać kasę!',
        short: 'Sprawdź swoje szczęście w kryminalnym świecie.',
    },
    flags: CommandFlags.Economy,

    permissions: {
        allowedRoles: null,
        allowedUsers: null,
    },
    expectedArgs: [],
    aliases: [],

    async execute(api) {
        const balance = await api.executor.economy.getBalance();
        const minBalance = Money.fromDollars(100);

        if (balance.wallet.lessThanOrEqual(minBalance)) {
            return api.log.replyError(
                api, 
                'Ta możliwość jest zablokowana!', 
                `Z racji, iż mógłbyś się zadłużyć i nie móc z tego wyjść potem bez resetu ekonomii, dokonywanie przestępstw jest dozwolone tylko, jeżeli masz więcej niż ${minBalance.format()}.`
            );
        }

        const result = await api.checkCooldown('crime', Cooldown);
        if (!result.can) {
            return api.log.replyWarn(api, 'Nie możesz jeszcze!', `Dopiero ${result.discordTime} odblokuje się możliwość ponownego spamienia sobie hajsu do portfela.`);
        }

        const baseAmount = getRandomInt(CrimeAmountMin, CrimeAmountMax);
        const win = Math.random() < Percentage;

        const multiplier = api.economy.getMultiplier('crime');
        const totalMoney = Money.fromDollarsFloat(win ? (baseAmount * multiplier) : baseAmount);

        if (win) await api.executor.economy.addWalletMoney(totalMoney);
        else await api.executor.economy.deductWalletMoney(totalMoney);

        await api.executor.cooldowns.set('crime', Date.now());

        let embed: ReplyEmbed;
        if (win) {
            const genMessage = randomElement(CrimeSuccessMessages);
            embed = api.log.getSuccessEmbed('W końcu udało się złamać prawo!', genMessage(totalMoney));
        } else {
            const genMessage = CrimeFailMessages[getRandomInt(0, CrimeFailMessages.length - 1)];
            embed = api.log.getErrorEmbed('Przestępstwo nie zawsze się opłaca!', genMessage(totalMoney))
        }

        return api.reply({ embeds: [embed] });
    },
};

export default crimeCmd;
