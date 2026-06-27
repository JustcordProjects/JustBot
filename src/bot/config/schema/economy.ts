import { Color } from '@/util/color.ts';
import * as dsc from 'discord.js';

export type Money = number;

export type Cond =
    | { op: 'has-role'; roleId: string }
    | { op: 'has-item'; itemId: string }
    | { op: 'money-gte'; amount: Money }
    | { op: 'money-lte'; amount: Money }
    | { op: 'random-chance'; chance: number };

export interface RandomVariant {
    weight?: number;
    actions: Action[];
}

// roleId = config role id (Role.id), not discord id (!)
export type Action =
    | { op: 'add-item'; itemId: string }
    | { op: 'rem-item'; itemId: string }
    | { op: 'add-role'; roleId: string }
    | { op: 'rem-role'; roleId: string }
    | { op: 'add-money'; amount: Money }
    | { op: 'sub-money'; amount: Money }
    | { op: 'random'; variants: RandomVariant[] }
    | { op: 'if'; cond: Cond; then: Action[]; else?: Action[] }
    | {
        op: 'while';
        cond: Cond;
        do: Action[];
        maxIterations?: number; // by default: 100
    };

export type MultiplierKind = 'work' | 'slut' | 'crime';
export type MultiplierFilter = MultiplierKind[] | '*';

export interface Multiplier {
    filter: MultiplierFilter;
    multiplier: number;
}

export interface RoleBenefits {
    multipliers: Multiplier[];
    dailyIncome: Action[];
}

export interface Thing {
    id: string;
    name: string;
    desc: string;
}

export interface Role extends Thing {
    discordRoleId: dsc.Snowflake;
    refund: Money;
    benefits: RoleBenefits;
}

export interface Item extends Thing {
    onUse: Action[]; // for example: add-role/add-money
    directOfferId?: string;
}

export interface ShopOffer extends Thing {
    price: Money;
    onBuy: Action[]; // for example: add-item
    buyOnce: boolean;
}

export interface ShopCategory {
    id: string;
    name: string;
    desc: string;
    emoji: string;
    color: Color;
    items: string[]; // offer IDs
}

// ----- config ----- //
export default interface Economy {
    currencySign: string;
    currencySignPlacement: 'left' | 'right';

    roles: Role[];
    items: Item[];
    offers: ShopOffer[];
    shop: ShopCategory[];
}
