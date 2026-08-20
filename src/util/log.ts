import { PredefinedColors } from '@/util/color.ts';
import { SendableChannel } from '../defs.ts';

import * as dsc from 'discord.js';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';
import { t } from '@/apis/translations/translate.ts';

export interface Replyable {
    // deno-lint-ignore no-explicit-any
    reply: (options: any) => Promise<dsc.OmitPartialGroupDMChannel<dsc.Message<boolean>> | dsc.Message<boolean>>;
}

enum LogType {
    Success,
    Info,
    Tip,
    Warn,
    Error,
}

function doGetEmbed(type: LogType, title: string, desc: string) {
    const settings = {
        [LogType.Success]: { emoji: '✅', color: PredefinedColors.Green },
        [LogType.Info]: { emoji: 'ℹ️', color: PredefinedColors.Cyan },
        [LogType.Tip]: { emoji: '💡', color: PredefinedColors.Purple },
        [LogType.Warn]: { emoji: '⚠️', color: PredefinedColors.Orange },
        [LogType.Error]: { emoji: '💔', color: PredefinedColors.Red },
    };

    return new ReplyEmbed()
        .setTitle(`${settings[type].emoji} ${title}`)
        .setColor(settings[type].color)
        .setAuthor({ name: 'JustBOT' })
        .setDescription(desc);
}

export function doGetErrorEmbed(title: string, desc: string) {
    return doGetEmbed(LogType.Error, t(title), t(desc));
}

export function doGetWarnEmbed(title: string, desc: string) {
    return doGetEmbed(LogType.Warn, t(title), t(desc));
}

export function doGetInfoEmbed(title: string, desc: string) {
    return doGetEmbed(LogType.Info, t(title), t(desc));
}

export function doGetSuccessEmbed(title: string, desc: string) {
    return doGetEmbed(LogType.Success, t(title), t(desc));
}

export function doGetTipEmbed(title: string, desc: string) {
    return doGetEmbed(LogType.Tip, t(title), t(desc));
}

export async function doReplyError(msg: Replyable, title: string, desc: string) {
    return msg.reply({ embeds: [doGetErrorEmbed(title, desc)] });
}

export async function doReplyWarn(msg: Replyable, title: string, desc: string) {
    return msg.reply({ embeds: [doGetWarnEmbed(title, desc)] });
}

export async function doReplyInfo(msg: Replyable, title: string, desc: string) {
    return msg.reply({ embeds: [doGetInfoEmbed(title, desc)] });
}

export async function doReplySuccess(msg: Replyable, title: string, desc: string) {
    return msg.reply({ embeds: [doGetSuccessEmbed(title, desc)] });
}

export async function doReplyTip(msg: Replyable, title: string, desc: string) {
    return msg.reply({ embeds: [doGetTipEmbed(title, desc)] });
}

export async function doSendError(channel: SendableChannel, title: string, desc: string) {
    return channel.send({ embeds: [doGetErrorEmbed(title, desc)] });
}

export async function doSendWarn(channel: SendableChannel, title: string, desc: string) {
    return channel.send({ embeds: [doGetWarnEmbed(title, desc)] });
}

export async function doSendInfo(channel: SendableChannel, title: string, desc: string) {
    return channel.send({ embeds: [doGetInfoEmbed(title, desc)] });
}

export async function doSendSuccess(channel: SendableChannel, title: string, desc: string) {
    return channel.send({ embeds: [doGetSuccessEmbed(title, desc)] });
}

export async function doSendTip(channel: SendableChannel, title: string, desc: string) {
    return channel.send({ embeds: [doGetTipEmbed(title, desc)] });
}
