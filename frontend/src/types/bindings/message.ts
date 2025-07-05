export enum MessageCase {
    DiceRoll = 'DiceRoll',
    Arrow = 'Arrow',
}

export type MessageCaseDiceRoll = {
    type: MessageCase.DiceRoll;
    sides: number;
    result: number;
};

export type MessageCaseArrow = {
    type: MessageCase.Arrow;
    from: string;
    to: string;
    arrow_type: ArrowType;
};

export type Message =
    | MessageCaseDiceRoll
    | MessageCaseArrow;

export enum ArrowType {
    CARD = 'CARD',
    ZONE = 'ZONE',
    PLAYER = 'PLAYER',
}
