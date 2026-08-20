import * as chars from '@/util/chars.ts';

import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';

import figlet from 'figlet';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';

function doTokenize(input: string): string[] {
    const result: string[] = [];
    let current: string = '';
    for (const char of input) {
        if (chars.isIdentch(char)) {
            current += char;
        } else {
            result.push(current);
            result.push(char);
            current = '';
        }
    }
    if (current != '') result.push(current);
    return result;
}

function doFigletFonts(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        figlet.fonts((err, fonts) => {
            if (err || !fonts) reject(err);
            else resolve(fonts);
        });
    });
}

function doFmtArr(arr: string[]): string {
    let result: string = '';
    for (let i = 0; i < arr.length - 1; ++i) {
        result += `\`${arr[i]}\``;
    }
    result += `lub \`${arr[arr.length - 1]}\``;
    return result;
}

function doRenderWord(word: string, font: string = 'Standard') {
    return figlet.textSync(word, { horizontalLayout: 'full', font }).split('\n');
}

function doConcatAsciiLine(lineA: string[], lineB: string[]): string[] {
    const maxLen = Math.max(lineA.length, lineB.length);
    const a = [...lineA, ...Array(maxLen - lineA.length).fill('')];
    const b = [...lineB, ...Array(maxLen - lineB.length).fill('')];
    return a.map((row, i) => row + b[i]);
}

function doAsciiWidth(asciiBlock: string[]) {
    return Math.max(...asciiBlock.map((line) => line.length));
}

function doRenderFigletWrapped(words: string[], font: string, maxWidth: number = 40): string[][] {
    const lines: string[][] = [];
    let currentLine: string[] = [];

    const flushLine = () => {
        if (currentLine.length > 0 && doAsciiWidth(currentLine) > 0) {
            lines.push(currentLine);
        }
        currentLine = [];
    };

    const addToLine = (block: string[]) => {
        if (doAsciiWidth(block) > maxWidth) {
            flushLine();
            lines.push(block);
            return;
        }
        if (currentLine.length === 0) {
            currentLine = block;
            return;
        }
        const testLine = doConcatAsciiLine(currentLine, block);
        if (doAsciiWidth(testLine) > maxWidth) {
            flushLine();
            currentLine = block;
        } else {
            currentLine = testLine;
        }
    };

    for (const word of words) {
        if (!word) continue;
        const renderedWord = doRenderWord(word, font);
        if (doAsciiWidth(currentLine.concat(renderedWord)) > maxWidth) {
            if (doAsciiWidth(renderedWord) <= maxWidth) {
                flushLine();
                addToLine(renderedWord);
                continue;
            }

            const letters = word.split('');
            for (const letter of letters) {
                const renderedLetter = doRenderWord(letter, font);
                addToLine(renderedLetter);
            }
        } else {
            addToLine(renderedWord);
        }
    }

    flushLine();
    return lines;
}

function doRenderFigletWrappedString(words: string[], font: string = 'Standard', maxWidth: number = 40): string {
    const blocks: string[][] = doRenderFigletWrapped(words, font, maxWidth);
    return blocks.map((block) => block.join('\n')).join('\n\n');
}

export default {
    name: 'figlet',
    aliases: ['render-ascii-text'],
    description: {
        main: 'Ta komenda renderuje ci taki fajny ascii text, podobnie do terminalowej komendy `figlet`.',
        short: 'Renderuje tekst jako ascii art',
    },
    flags: CommandFlags.Spammy | CommandFlags.WorksInDM,

    expectedArgs: [
        //{
        //    name: 'font',
        //    description: 'Czcionka jakiej chcesz użyć. Możesz wybrać: ' + fmtArr(await figletFonts()) + '.',
        //    type: { base: 'string' },
        //    optional: true,
        //},
        {
            name: 'text',
            description: 'Tekst który chcesz wyrenderować',
            type: { base: 'string', trailing: true },
            optional: false,
        },
    ],
    permissions: {
        allowedUsers: null,
        allowedRoles: null,
    },

    async execute(api) {
        const font = /*api.getArg('font').value as string ??*/ 'Standard';
        const textArg = api.getTypedArg('text', 'string').value as string;

        const text = textArg == 'hubix' ? 'pedał' : textArg == 'just bot' ? 'istota wyższa' : textArg;

        const availableFonts = await doFigletFonts();
        if (!availableFonts.includes(font)) {
            return api.log.replyError(
                api,
                'Nieznana czcionka!',
                `Nie znam czionki o nazwie ${font}.\n**Spróbuj tak:** ${doFmtArr(availableFonts)}`,
            );
        }

        const words = doTokenize(text);
        const result = doRenderFigletWrappedString(words, font, 40);

        return api.reply({
            embeds: [new ReplyEmbed().setTitle('Wynik').setDescription(`\`\`\`${result}\`\`\``)],
        });
    },
} satisfies Command;