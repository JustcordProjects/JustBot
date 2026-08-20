import { APIEmbed, APIEmbedField, APIEmbedFooter, EmbedAuthorOptions, EmbedBuilder, RestOrArray } from 'discord.js';
import { doTranslate } from './translate.ts';

import * as dsc from 'discord.js';

export class ReplyEmbed {
    private embedBuilder: EmbedBuilder = new EmbedBuilder();

    setAuthor(author: EmbedAuthorOptions) {
        this.embedBuilder.setAuthor(doTranslate(author));
        return this;
    }

    setColor(color: dsc.ColorResolvable) {
        this.embedBuilder.setColor(color);
        return this;
    }

    setDescription(desc: string) {
        this.embedBuilder.setDescription(doTranslate(desc));
        return this;
    }

    setTitle(title: string) {
        this.embedBuilder.setTitle(doTranslate(title));
        return this;
    }

    setFields(...fields: RestOrArray<APIEmbedField>) {
        this.embedBuilder.setFields(...doTranslate(fields));
        return this;
    }

    addFields(...fields: RestOrArray<APIEmbedField>) {
        this.embedBuilder.addFields(...doTranslate(fields));
        return this;
    }

    setFooter(footer: APIEmbedFooter) {
        this.embedBuilder.setFooter(doTranslate(footer));
        return this;
    }

    setImage(img: string) {
        this.embedBuilder.setImage(doTranslate(img));
        return this;
    }

    setThumbnail(img: string) {
        this.embedBuilder.setThumbnail(doTranslate(img));
        return this;
    }

    setURL(url: string) {
        this.embedBuilder.setURL(doTranslate(url));
        return this;
    }

    setTimestamp(timestamp?: Date | number | null) {
        this.embedBuilder.setTimestamp(timestamp);
        return this;
    }

    toJSON(): APIEmbed {
        return this.embedBuilder.toJSON();
    }
}
