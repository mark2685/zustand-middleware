export type Cast<T, U> = T extends U ? T : U;

export type Write<T, U> = Omit<T, keyof U> & U;
