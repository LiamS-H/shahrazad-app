export const Keys = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
] as const;
export type Key = (typeof Keys)[number];

export type Shortcut =
    | [Key]
    | ["Ctrl", Key]
    | ["Ctrl", "Shift", Key]
    | ["Shift", Key];
